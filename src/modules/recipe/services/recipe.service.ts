import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RecipeRepository } from '../repositories';
import { GenerateRecipeDto, GenerateRecipeResponseDto, RecipeResponseDto } from '../dto';
import { Recipe, RecipeDifficulty } from '../entities';
import { GeminiService } from './gemini.service';
import { EmbeddingService } from '../../embedding';
import { AllergenService } from '../../allergen';
import { DietaryService } from '../../dietary';
import { SafetyService } from '../../safety';

@Injectable()
export class RecipeService {
    private readonly logger = new Logger(RecipeService.name);

    constructor(
        private readonly recipeRepository: RecipeRepository,
        private readonly geminiService: GeminiService,
        private readonly embeddingService: EmbeddingService,
        private readonly allergenService: AllergenService,
        private readonly dietaryService: DietaryService,
        private readonly safetyService: SafetyService,
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
     * Save generated recipes to database with embeddings
     */
    async saveGeneratedRecipes(
        recipes: Partial<Recipe>[],
        fingerprint: string,
    ): Promise<Recipe[]> {
        // Generate embeddings for each recipe
        const recipesWithEmbeddings = await Promise.all(
            recipes.map(async (r) => {
                const embedding = await this.embeddingService.generateRecipeEmbedding({
                    title: r.title || '',
                    description: r.description,
                    ingredients: r.ingredients || [],
                    tags: r.tags,
                });

                return {
                    ...r,
                    inputFingerprint: fingerprint,
                    isGenerated: true,
                    embedding: embedding ?? undefined,
                };
            }),
        );

        this.logger.log(`Generated embeddings for ${recipesWithEmbeddings.length} recipes`);
        return this.recipeRepository.createMany(recipesWithEmbeddings);
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

        // Post-processing: Filter recipes that contain user allergens
        const userAllergens = dto.allergies || [];
        const filteredRecipes = generatedRecipes.filter(recipe => {
            if (userAllergens.length === 0) return true;

            const validation = this.allergenService.validateRecipe(
                { title: recipe.title, ingredients: recipe.ingredients, description: recipe.description },
                userAllergens
            );

            if (!validation.isSafe) {
                this.logger.warn(`Recipe "${recipe.title}" filtered out: ${validation.warnings.join(', ')}`);
                return false;
            }
            return true;
        });

        if (filteredRecipes.length < generatedRecipes.length) {
            this.logger.log(`Filtered ${generatedRecipes.length - filteredRecipes.length} recipes containing allergens`);
        }

        // Post-processing: Validate dietary compliance and add tags
        const userPreferences = dto.preferences || [];
        const processedRecipes = filteredRecipes.map(recipe => {
            let recipeTags = [...(recipe.tags || [])];

            // Check dietary compliance
            if (userPreferences.length > 0) {
                const compliance = this.dietaryService.checkCompliance(
                    recipe.ingredients,
                    userPreferences
                );

                if (compliance.compliant) {
                    // Add dietary tags if compliant
                    const requiredTags = this.dietaryService.getRequiredTags(userPreferences);
                    recipeTags = [...new Set([...recipeTags, ...requiredTags])];
                } else {
                    this.logger.warn(`Recipe "${recipe.title}" may not fully comply: ${compliance.violations.join(', ')}`);
                }
            }

            return { ...recipe, tags: recipeTags };
        });

        // Post-processing: Auto-generate safety notes
        const finalRecipes = processedRecipes.map(recipe => {
            const enhancedSafetyNotes = this.safetyService.generateSafetyNotes(
                recipe.ingredients,
                recipe.steps,
                recipe.safetyNotes || []
            );
            return { ...recipe, safetyNotes: enhancedSafetyNotes };
        });

        // Convert to entity format and save
        const recipesToSave: Partial<Recipe>[] = finalRecipes.map((r) => ({
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

    /**
     * Find all saved/bookmarked recipes for a session
     */
    async findSaved(sessionId?: string): Promise<RecipeResponseDto[]> {
        const recipes = await this.recipeRepository.findSaved(sessionId);
        return recipes.map(this.toResponseDto);
    }

    /**
     * Save/bookmark a recipe
     */
    async saveRecipe(recipeId: string): Promise<RecipeResponseDto | null> {
        const recipe = await this.recipeRepository.setSaved(recipeId, true);
        return recipe ? this.toResponseDto(recipe) : null;
    }

    /**
     * Unsave/remove bookmark from a recipe
     */
    async unsaveRecipe(recipeId: string): Promise<boolean> {
        const recipe = await this.recipeRepository.setSaved(recipeId, false);
        return recipe !== null;
    }

    /**
     * Find similar recipes based on embedding similarity
     */
    async findSimilarRecipes(
        recipeId: string,
        limit: number = 5,
    ): Promise<RecipeResponseDto[]> {
        // Get the target recipe
        const targetRecipe = await this.recipeRepository.findById(recipeId);
        if (!targetRecipe || !targetRecipe.embedding) {
            this.logger.warn(`Recipe ${recipeId} not found or has no embedding`);
            return [];
        }

        // Get all recipes with embeddings
        const allRecipes = await this.recipeRepository.findAllWithEmbeddings();

        // Filter out the target recipe and calculate similarities
        const candidates = allRecipes
            .filter((r) => r.id !== recipeId && r.embedding)
            .map((r) => ({
                id: r.id,
                embedding: r.embedding!,
            }));

        if (candidates.length === 0) {
            return [];
        }

        // Find similar using embedding service
        const similar = this.embeddingService.findSimilar(
            targetRecipe.embedding,
            candidates,
            limit,
        );

        // Get full recipe data for similar recipes
        const similarRecipes = await Promise.all(
            similar.map(async (s) => {
                const recipe = await this.recipeRepository.findById(s.id);
                return recipe ? this.toResponseDto(recipe) : null;
            }),
        );

        return similarRecipes.filter((r): r is RecipeResponseDto => r !== null);
    }

    /**
     * Find alternative recipes based on available ingredients
     * Uses ingredient matching and embedding similarity
     */
    async findAlternatives(
        ingredients: string[],
        allergies: string[] = [],
        preferences: string[] = [],
        limit: number = 5,
    ): Promise<{ recipes: RecipeResponseDto[]; matchScore: number }[]> {
        // Get all recipes with embeddings
        const allRecipes = await this.recipeRepository.findAllWithEmbeddings();

        if (allRecipes.length === 0) {
            this.logger.log('No recipes found for alternatives');
            return [];
        }

        // Normalize input ingredients
        const normalizedInput = ingredients.map(i => i.toLowerCase().trim());
        const normalizedAllergies = allergies.map(a => a.toLowerCase().trim());

        // Calculate match scores for each recipe
        const scoredRecipes = allRecipes
            .filter(recipe => {
                // Filter out recipes containing allergens
                if (normalizedAllergies.length > 0) {
                    const recipeIngredients = recipe.ingredients.join(' ').toLowerCase();
                    const hasAllergen = normalizedAllergies.some(allergen =>
                        recipeIngredients.includes(allergen)
                    );
                    if (hasAllergen) return false;
                }
                return true;
            })
            .map(recipe => {
                // Calculate ingredient match score
                const recipeIngredients = recipe.ingredients.map(i => i.toLowerCase());
                let matchCount = 0;

                for (const inputIng of normalizedInput) {
                    const hasMatch = recipeIngredients.some(recipeIng =>
                        recipeIng.includes(inputIng) || inputIng.includes(recipeIng)
                    );
                    if (hasMatch) matchCount++;
                }

                // Score: percentage of input ingredients found in recipe
                const matchScore = normalizedInput.length > 0
                    ? Math.round((matchCount / normalizedInput.length) * 100)
                    : 0;

                return {
                    recipe: this.toResponseDto(recipe),
                    matchScore,
                };
            })
            .filter(item => item.matchScore > 0) // Only include recipes with at least one match
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

        return scoredRecipes.map(item => ({
            recipes: [item.recipe],
            matchScore: item.matchScore,
        }));
    }
}
