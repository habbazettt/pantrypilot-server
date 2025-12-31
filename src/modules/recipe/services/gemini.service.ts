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
                easy: 'easy (suitable for beginners)',
                medium: 'medium (needs some experience)',
                hard: 'hard (advanced cooking techniques)',
            };
            constraints.push(`Difficulty Level: ${difficultyMap[dto.difficulty] || dto.difficulty}`);
        }

        if (dto.allergies && dto.allergies.length > 0) {
            constraints.push(`AVOID the following ingredients (allergies/restrictions): ${dto.allergies.join(', ')}`);
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
                constraints.push(`REQUIRED TAGS: ${requiredTags.join(', ')}`);
            }
        }

        if (dto.cuisine) {
            constraints.push(`CUISINE STYLE: ${dto.cuisine.toUpperCase()} (Ensure recipes are authentic to this cuisine)`);
        }

        const constraintText = constraints.length > 0
            ? `\n\nSPECIAL CONDITIONS (MUST COMPLY):\n${constraints.map(c => `• ${c}`).join('\n')}`
            : '';

        return `You are a professional chef with 15 years of experience in 5-star restaurants, specializing in global cuisine (Asian, Western, Fusion). A customer has come with ingredients they have at home and wants recipe recommendations.

CUSTOMER'S INGREDIENTS:
${ingredientList}

MAX COOKING TIME: ${maxTime} minutes${constraintText}

YOUR TASK:
As a professional chef, recommend 3 distinct recipes that can be made with these ingredients. Use your creativity and culinary knowledge to provide recipes that:
1. Are authentic and delicious - not generic
2. Utilize the provided ingredients optimally
3. Offer variety (e.g., one soup, one stir-fry, one main dish)
4. Include detailed steps suitable for a home cook
5. Include professional cooking tips where relevant

You may assume standard pantry staples (salt, sugar, oil, onions, garlic, chili, etc.) are available.

RESPONSE FORMAT (JSON array only):
[
  {
    "title": "Full recipe name",
    "description": "Appetizing description of the dish, why it's good, expected texture and taste",
    "ingredients": ["Detailed ingredient list with specific measurements"],
    "steps": ["Detailed cooking steps with specific times and techniques"],
    "estimatedTime": number (in minutes),
    "difficulty": "easy" or "medium" or "hard",
    "safetyNotes": ["Safety and health tips. Do NOT split single sentences into multiple items. Keep full sentences together."],
    "tags": ["Category, suitable for, etc."]
  }
]

Provide the response in JSON format only, without markdown code blocks.`;
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
                title: `Stir-fried ${dto.ingredients[0] || 'Vegetables'} Special`,
                description: `A delicious stir-fry recipe using: ${ingredientsList}`,
                ingredients: dto.ingredients.map((i) => `Enough ${i}`),
                steps: [
                    'Prepare all ingredients and wash them thoroughly',
                    'Heat oil in a pan',
                    'Sauté spices until fragrant',
                    `Add ${dto.ingredients[0] || 'main ingredient'}, stir well`,
                    'Add seasoning to taste',
                    'Cook until done and serve',
                ],
                estimatedTime: dto.maxTime || 30,
                difficulty,
                safetyNotes: ['Ensure ingredients are cooked thoroughly'],
                tags: ['quick', 'easy', 'stub'],
            },
        ];
    }
}
