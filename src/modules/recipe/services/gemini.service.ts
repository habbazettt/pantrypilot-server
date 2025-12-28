import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GenerateRecipeDto } from '../dto';
import { Recipe, RecipeDifficulty } from '../entities';
import { DietaryService } from '../../dietary';

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

    constructor(
        private readonly configService: ConfigService,
        private readonly dietaryService: DietaryService,
    ) { }

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
        const maxTime = dto.maxTime || 60;
        const ingredientList = dto.ingredients.join(', ');

        // Build constraints
        const constraints: string[] = [];

        if (dto.difficulty && String(dto.difficulty) !== 'any') {
            const difficultyMap: Record<string, string> = {
                easy: 'mudah (cocok untuk pemula)',
                medium: 'sedang (butuh sedikit pengalaman)',
                hard: 'sulit (teknik masak tingkat lanjut)',
            };
            constraints.push(`Tingkat kesulitan: ${difficultyMap[dto.difficulty] || dto.difficulty}`);
        }

        if (dto.allergies && dto.allergies.length > 0) {
            constraints.push(`HINDARI bahan berikut (alergi/pantangan): ${dto.allergies.join(', ')}`);
        }

        // Inject dietary preferences with detailed hints
        if (dto.preferences && dto.preferences.length > 0) {
            const dietaryHints = this.dietaryService.buildPromptHints(dto.preferences);
            if (dietaryHints.length > 0) {
                constraints.push(`PREFERENSI DIET WAJIB DIPATUHI:`);
                dietaryHints.forEach(hint => constraints.push(`  → ${hint}`));
            }

            // Get required tags for dietary preferences
            const requiredTags = this.dietaryService.getRequiredTags(dto.preferences);
            if (requiredTags.length > 0) {
                constraints.push(`Tags yang WAJIB disertakan: ${requiredTags.join(', ')}`);
            }
        }

        const constraintText = constraints.length > 0
            ? `\n\nKONDISI KHUSUS (WAJIB DIPATUHI):\n${constraints.map(c => `• ${c}`).join('\n')}`
            : '';

        return `Anda adalah seorang chef profesional dengan pengalaman 15 tahun di restoran bintang 5, spesialisasi masakan Indonesia, Asia, dan fusion. Seorang pelanggan datang dengan bahan-bahan yang mereka punya di rumah dan meminta rekomendasi menu.

BAHAN YANG DIMILIKI PELANGGAN:
${ingredientList}

WAKTU MEMASAK MAKSIMAL: ${maxTime} menit${constraintText}

TUGAS ANDA:
Sebagai chef profesional, rekomendasikan 3 menu masakan berbeda yang bisa dibuat dengan bahan-bahan tersebut. Gunakan kreativitas dan pengetahuan kuliner Anda untuk memberikan resep yang:
1. Autentik dan lezat - bukan resep generik
2. Menggunakan bahan-bahan yang disediakan secara optimal
3. Memiliki variasi (misal: satu masakan berkuah, satu tumisan, satu hidangan lain)
4. Langkah-langkah yang detail dan bisa diikuti oleh home cook
5. Termasuk tips memasak profesional jika relevan

Anda boleh menambahkan bumbu dapur standar (garam, gula, minyak, bawang, cabai, dll) jika diperlukan untuk melengkapi resep.

FORMAT RESPONS (JSON array):
[
  {
    "title": "nama menu lengkap",
    "description": "deskripsi appetizing tentang masakan ini, kenapa enak, tekstur dan rasa yang diharapkan",
    "ingredients": ["bahan lengkap dengan takaran spesifik seperti di buku resep profesional"],
    "steps": ["langkah detail, dengan waktu dan teknik memasak yang spesifik"],
    "estimatedTime": angka dalam menit,
    "difficulty": "easy" atau "medium" atau "hard",
    "safetyNotes": ["tips keamanan dan kesehatan jika ada"],
    "tags": ["kategori masakan, cocok untuk apa, dsb"]
  }
]

Berikan respons dalam format JSON saja, tanpa markdown code block.`;
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
