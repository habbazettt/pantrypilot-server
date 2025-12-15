import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RecipeRepository } from '../repositories';
import { GenerateRecipeDto, GenerateRecipeResponseDto, RecipeResponseDto } from '../dto';
import { Recipe, RecipeDifficulty } from '../entities';
import { GeminiService } from './gemini.service';

@Injectable()
export class RecipeService {
    private readonly logger = new Logger(RecipeService.name);

    constructor(
        private readonly recipeRepository: RecipeRepository,
        private readonly geminiService: GeminiService,
    ) { }

    /**
     * Generate fingerprint from ingredients for caching
     */
    generateFingerprint(dto: GenerateRecipeDto): string {
        const normalized = {
            ingredients: [...dto.ingredients].sort().map((i) => i.toLowerCase().trim()),
            maxTime: dto.maxTime || 60,
            difficulty: dto.difficulty || 'any',
            allergies: (dto.allergies || []).sort(),
            preferences: (dto.preferences || []).sort(),
        };
        return crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex').slice(0, 16);
    }

    /**
     * Find all recipes
     */
    async findAll(): Promise<RecipeResponseDto[]> {
        const recipes = await this.recipeRepository.findAll();
        return recipes.map(this.toResponseDto);
    }

    /**
     * Find recipe by ID
     */
    async findById(id: string): Promise<RecipeResponseDto | null> {
        const recipe = await this.recipeRepository.findById(id);
        return recipe ? this.toResponseDto(recipe) : null;
    }

    /**
     * Find recipes by fingerprint (for cache lookup)
     */
    async findByFingerprint(fingerprint: string): Promise<Recipe[]> {
        return this.recipeRepository.findByFingerprint(fingerprint);
    }

    /**
     * Save generated recipes to database
     */
    async saveGeneratedRecipes(
        recipes: Partial<Recipe>[],
        fingerprint: string,
    ): Promise<Recipe[]> {
        const recipesWithFingerprint = recipes.map((r) => ({
            ...r,
            inputFingerprint: fingerprint,
            isGenerated: true,
        }));
        return this.recipeRepository.createMany(recipesWithFingerprint);
    }

    /**
     * Generate recipes from ingredients using Gemini AI
     */
    async generateRecipes(dto: GenerateRecipeDto): Promise<GenerateRecipeResponseDto> {
        const fingerprint = this.generateFingerprint(dto);
        this.logger.log(`Generating recipes for fingerprint: ${fingerprint}`);

        // Check cache first
        const cachedRecipes = await this.findByFingerprint(fingerprint);
        if (cachedRecipes.length > 0) {
            this.logger.log(`Cache hit! Found ${cachedRecipes.length} cached recipes`);
            return {
                recipes: cachedRecipes.map(this.toResponseDto),
                cached: true,
                generatedAt: new Date().toISOString(),
                fingerprint,
            };
        }

        // Generate using Gemini AI
        this.logger.log('Cache miss, generating new recipes with Gemini...');
        const generatedRecipes = await this.geminiService.generateRecipes(dto);

        // Convert to entity format and save
        const recipesToSave: Partial<Recipe>[] = generatedRecipes.map((r) => ({
            title: r.title,
            description: r.description,
            ingredients: r.ingredients,
            steps: r.steps,
            estimatedTime: r.estimatedTime,
            difficulty: r.difficulty,
            safetyNotes: r.safetyNotes,
            tags: r.tags,
        }));

        const savedRecipes = await this.saveGeneratedRecipes(recipesToSave, fingerprint);

        return {
            recipes: savedRecipes.map(this.toResponseDto),
            cached: false,
            generatedAt: new Date().toISOString(),
            fingerprint,
        };
    }

    /**
     * Convert entity to response DTO
     */
    private toResponseDto(recipe: Recipe): RecipeResponseDto {
        return {
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            estimatedTime: recipe.estimatedTime,
            difficulty: recipe.difficulty,
            safetyNotes: recipe.safetyNotes,
            tags: recipe.tags,
            rating: recipe.rating,
            createdAt: recipe.createdAt,
        };
    }
}
