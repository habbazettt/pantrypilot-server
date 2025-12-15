import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GenerateRecipeDto } from '../dto';
import { Recipe, RecipeDifficulty } from '../entities';

export interface GeneratedRecipe {
    title: string;
    description: string;
    ingredients: string[];
    steps: string[];
    estimatedTime: number;
    difficulty: RecipeDifficulty;
    safetyNotes: string[];
    tags: string[];
}

@Injectable()
export class GeminiService implements OnModuleInit {
    private readonly logger = new Logger(GeminiService.name);
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        const apiKey = this.configService.get<string>('llm.geminiApiKey');
        const modelName = this.configService.get<string>('llm.geminiModel') || 'gemini-1.5-flash';

        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not set, LLM features will use stub mode');
            return;
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        this.logger.log(`Gemini initialized with model: ${modelName}`);
    }

    /**
     * Generate recipes using Gemini AI
     */
    async generateRecipes(dto: GenerateRecipeDto): Promise<GeneratedRecipe[]> {
        if (!this.model) {
            this.logger.warn('Gemini not initialized, returning stub recipes');
            return this.generateStubRecipes(dto);
        }

        const prompt = this.buildPrompt(dto);

        try {
            this.logger.log('Calling Gemini API for recipe generation...');
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseResponse(text, dto);
        } catch (error) {
            this.logger.error(`Gemini API error: ${error.message}`, error.stack);
            this.logger.warn('Falling back to stub recipes');
            return this.generateStubRecipes(dto);
        }
    }

    /**
     * Build prompt for recipe generation
     */
    private buildPrompt(dto: GenerateRecipeDto): string {
        const difficulty = dto.difficulty || 'any';
        const maxTime = dto.maxTime || 60;
        const allergies = dto.allergies?.join(', ') || 'none';
        const preferences = dto.preferences?.join(', ') || 'none';

        return `Kamu adalah chef profesional Indonesia. Buatkan 3 resep masakan berdasarkan bahan-bahan berikut:

BAHAN YANG TERSEDIA:
${dto.ingredients.map((i) => `- ${i}`).join('\n')}

PREFERENSI:
- Tingkat kesulitan: ${difficulty}
- Waktu maksimal: ${maxTime} menit
- Alergi/pantangan: ${allergies}
- Preferensi diet: ${preferences}

FORMAT OUTPUT (JSON array, tanpa markdown code block):
[
  {
    "title": "Nama Resep",
    "description": "Deskripsi singkat resep dalam 1-2 kalimat",
    "ingredients": ["bahan 1 dengan takaran", "bahan 2 dengan takaran"],
    "steps": ["Langkah 1", "Langkah 2", "Langkah 3"],
    "estimatedTime": 30,
    "difficulty": "easy|medium|hard",
    "safetyNotes": ["catatan keamanan jika ada"],
    "tags": ["tag1", "tag2"]
  }
]

Berikan resep yang praktis, mudah diikuti, dan sesuai dengan masakan Indonesia atau Asia. Pastikan semua bahan yang diminta terpakai.`;
    }

    /**
     * Parse Gemini response to recipe objects
     */
    private parseResponse(text: string, dto: GenerateRecipeDto): GeneratedRecipe[] {
        try {
            // Clean up the response - remove markdown code blocks if present
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.slice(7);
            }
            if (cleanText.startsWith('```')) {
                cleanText = cleanText.slice(3);
            }
            if (cleanText.endsWith('```')) {
                cleanText = cleanText.slice(0, -3);
            }
            cleanText = cleanText.trim();

            const recipes = JSON.parse(cleanText) as GeneratedRecipe[];

            // Validate and normalize
            return recipes.map((r) => ({
                title: r.title || 'Resep Tanpa Nama',
                description: r.description || '',
                ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
                steps: Array.isArray(r.steps) ? r.steps : [],
                estimatedTime: typeof r.estimatedTime === 'number' ? r.estimatedTime : 30,
                difficulty: this.normalizeDifficulty(r.difficulty),
                safetyNotes: Array.isArray(r.safetyNotes) ? r.safetyNotes : [],
                tags: Array.isArray(r.tags) ? r.tags : [],
            }));
        } catch (error) {
            this.logger.error(`Failed to parse Gemini response: ${error.message}`);
            this.logger.debug(`Raw response: ${text}`);
            return this.generateStubRecipes(dto);
        }
    }

    /**
     * Normalize difficulty string to enum
     */
    private normalizeDifficulty(difficulty: string): RecipeDifficulty {
        const normalized = String(difficulty).toLowerCase();
        if (normalized === 'easy') return RecipeDifficulty.EASY;
        if (normalized === 'hard') return RecipeDifficulty.HARD;
        return RecipeDifficulty.MEDIUM;
    }

    /**
     * Stub recipe generator (fallback)
     */
    private generateStubRecipes(dto: GenerateRecipeDto): GeneratedRecipe[] {
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
                tags: ['quick', 'easy', 'stub'],
            },
        ];
    }
}
