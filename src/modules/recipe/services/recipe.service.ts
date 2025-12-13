import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RecipeRepository } from '../repositories';
import { GenerateRecipeDto, GenerateRecipeResponseDto, RecipeResponseDto } from '../dto';
import { Recipe, RecipeDifficulty } from '../entities';

@Injectable()
export class RecipeService {
    private readonly logger = new Logger(RecipeService.name);

    constructor(private readonly recipeRepository: RecipeRepository) { }

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
     * Generate recipes from ingredients (stub implementation)
     * This will be replaced with actual LLM integration
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

        // TODO: Replace with actual LLM call
        this.logger.log('Cache miss, generating new recipes...');
        const generatedRecipes = this.generateStubRecipes(dto);

        // Save to database
        const savedRecipes = await this.saveGeneratedRecipes(generatedRecipes, fingerprint);

        return {
            recipes: savedRecipes.map(this.toResponseDto),
            cached: false,
            generatedAt: new Date().toISOString(),
            fingerprint,
        };
    }

    /**
     * Stub recipe generator (placeholder for LLM)
     */
    private generateStubRecipes(dto: GenerateRecipeDto): Partial<Recipe>[] {
        const ingredientsList = dto.ingredients.join(', ');
        const difficulty = dto.difficulty || RecipeDifficulty.MEDIUM;

        return [
            {
                title: `Tumis ${dto.ingredients[0] || 'Sayuran'} Spesial`,
                description: `Resep tumis lezat dengan bahan: ${ingredientsList}`,
                ingredients: dto.ingredients.map((i) => `Secukupnya ${i}`),
                steps: [
                    'Siapkan semua bahan dan cuci bersih',
                    'Panaskan minyak di wajan',
                    'Tumis bumbu hingga harum',
                    `Masukkan ${dto.ingredients[0] || 'bahan utama'}, aduk rata`,
                    'Tambahkan bumbu penyedap secukupnya',
                    'Masak hingga matang dan sajikan',
                ],
                estimatedTime: dto.maxTime || 30,
                difficulty,
                safetyNotes: ['Pastikan bahan sudah matang sempurna'],
                tags: ['quick', 'easy', 'homemade'],
            },
            {
                title: `Sup ${dto.ingredients[0] || 'Hangat'} Rumahan`,
                description: `Sup hangat dengan campuran ${ingredientsList}`,
                ingredients: [
                    ...dto.ingredients.map((i) => `100g ${i}`),
                    '1 liter air kaldu',
                    'Garam dan merica secukupnya',
                ],
                steps: [
                    'Didihkan air kaldu dalam panci',
                    'Masukkan bahan-bahan satu per satu',
                    'Masak dengan api sedang selama 20 menit',
                    'Tambahkan garam dan merica',
                    'Sajikan hangat',
                ],
                estimatedTime: (dto.maxTime || 30) + 10,
                difficulty,
                safetyNotes: ['Hati-hati dengan sup panas'],
                tags: ['soup', 'comfort-food', 'healthy'],
            },
            {
                title: `${dto.ingredients[0] || 'Bahan'} Panggang Madu`,
                description: `Hidangan panggang dengan ${ingredientsList} dan saus madu`,
                ingredients: [
                    ...dto.ingredients.map((i) => `250g ${i}`),
                    '3 sdm madu',
                    '2 sdm kecap asin',
                    '1 sdm minyak wijen',
                ],
                steps: [
                    'Campurkan madu, kecap, dan minyak wijen untuk saus',
                    'Lumuri bahan utama dengan saus',
                    'Marinasi selama 15 menit',
                    'Panggang di suhu 180°C selama 25 menit',
                    'Olesi saus lagi di tengah proses',
                    'Sajikan dengan garnish',
                ],
                estimatedTime: (dto.maxTime || 30) + 15,
                difficulty: RecipeDifficulty.MEDIUM,
                safetyNotes: ['Gunakan sarung tangan saat mengeluarkan dari oven'],
                tags: ['baked', 'sweet', 'dinner'],
            },
        ];
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
