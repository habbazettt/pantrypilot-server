import { Injectable, Logger } from '@nestjs/common';

export interface DietaryPreference {
    name: string;
    description: string;
    excludedIngredients: string[];
    requiredTags: string[];
    promptHint: string;
}

@Injectable()
export class DietaryService {
    private readonly logger = new Logger(DietaryService.name);

    /**
     * Supported dietary preferences with their rules
     */
    private readonly dietaryPreferences: Record<string, DietaryPreference> = {
        vegetarian: {
            name: 'Vegetarian',
            description: 'No meat or fish, but allows eggs and dairy',
            excludedIngredients: [
                'daging', 'ayam', 'sapi', 'babi', 'kambing', 'bebek',
                'ikan', 'udang', 'kepiting', 'cumi', 'kerang', 'lobster',
                'fish', 'chicken', 'beef', 'pork', 'meat', 'seafood',
                'bacon', 'ham', 'sosis', 'kornet', 'bakso',
            ],
            requiredTags: ['vegetarian'],
            promptHint: 'Resep harus vegetarian - TIDAK BOLEH mengandung daging atau seafood apapun. Boleh menggunakan telur dan produk susu.',
        },
        vegan: {
            name: 'Vegan',
            description: 'No animal products at all',
            excludedIngredients: [
                'daging', 'ayam', 'sapi', 'babi', 'kambing', 'bebek',
                'ikan', 'udang', 'kepiting', 'cumi', 'kerang', 'lobster',
                'telur', 'susu', 'keju', 'mentega', 'yogurt', 'krim',
                'madu', 'gelatin',
                'fish', 'chicken', 'beef', 'pork', 'meat', 'seafood',
                'egg', 'milk', 'cheese', 'butter', 'cream', 'honey',
            ],
            requiredTags: ['vegan', 'plant-based'],
            promptHint: 'Resep harus vegan - TIDAK BOLEH mengandung produk hewani apapun termasuk daging, seafood, telur, susu, keju, mentega, dan madu. Hanya bahan nabati.',
        },
        halal: {
            name: 'Halal',
            description: 'Compliant with Islamic dietary laws',
            excludedIngredients: [
                'babi', 'pork', 'bacon', 'ham', 'lard',
                'alkohol', 'mirin', 'wine', 'beer', 'sake', 'arak',
                'gelatin babi',
            ],
            requiredTags: ['halal'],
            promptHint: 'Resep harus halal - TIDAK BOLEH mengandung babi, produk babi, atau alkohol. Pastikan semua bahan halal.',
        },
        'gluten-free': {
            name: 'Gluten-Free',
            description: 'No gluten-containing ingredients',
            excludedIngredients: [
                'tepung terigu', 'gandum', 'roti', 'pasta', 'mie',
                'kecap', 'saus tiram', 'beer',
                'wheat', 'flour', 'bread', 'pasta', 'noodle',
                'barley', 'oat',
            ],
            requiredTags: ['gluten-free'],
            promptHint: 'Resep harus bebas gluten - TIDAK BOLEH mengandung tepung terigu, gandum, roti, pasta, atau mie biasa. Gunakan alternatif seperti tepung beras atau tapioka.',
        },
        'dairy-free': {
            name: 'Dairy-Free',
            description: 'No dairy products',
            excludedIngredients: [
                'susu', 'susu sapi', 'krim', 'keju', 'mentega', 'yogurt',
                'whey', 'kasein', 'laktosa',
                'milk', 'cream', 'cheese', 'butter', 'yogurt',
            ],
            requiredTags: ['dairy-free'],
            promptHint: 'Resep harus bebas susu - TIDAK BOLEH mengandung susu, keju, mentega, krim, atau produk olahan susu lainnya.',
        },
        'low-carb': {
            name: 'Low-Carb',
            description: 'Reduced carbohydrate content',
            excludedIngredients: [
                'nasi', 'beras', 'roti', 'pasta', 'mie', 'kentang',
                'gula', 'tepung', 'singkong', 'ubi',
                'rice', 'bread', 'pasta', 'potato', 'sugar',
            ],
            requiredTags: ['low-carb', 'keto-friendly'],
            promptHint: 'Resep harus rendah karbohidrat - HINDARI nasi, roti, pasta, kentang, dan gula. Fokus pada protein dan sayuran.',
        },
    };

    /**
     * Get all supported dietary preferences
     */
    getAllPreferences(): Record<string, DietaryPreference> {
        return this.dietaryPreferences;
    }

    /**
     * Get preference names
     */
    getPreferenceNames(): string[] {
        return Object.keys(this.dietaryPreferences);
    }

    /**
     * Get preference by name
     */
    getPreference(name: string): DietaryPreference | null {
        return this.dietaryPreferences[name.toLowerCase()] || null;
    }

    /**
     * Build prompt hints for user's dietary preferences
     */
    buildPromptHints(preferences: string[]): string[] {
        const hints: string[] = [];

        for (const pref of preferences) {
            const preference = this.getPreference(pref);
            if (preference) {
                hints.push(preference.promptHint);
            }
        }

        return hints;
    }

    /**
     * Check if ingredients comply with dietary preference
     */
    checkCompliance(
        ingredients: string[],
        preferences: string[],
    ): { compliant: boolean; violations: string[] } {
        const violations: string[] = [];
        const ingredientText = ingredients.join(' ').toLowerCase();

        for (const pref of preferences) {
            const preference = this.getPreference(pref);
            if (!preference) continue;

            for (const excluded of preference.excludedIngredients) {
                if (ingredientText.includes(excluded.toLowerCase())) {
                    violations.push(`"${excluded}" tidak sesuai dengan ${preference.name}`);
                }
            }
        }

        return {
            compliant: violations.length === 0,
            violations,
        };
    }

    /**
     * Get required tags for preferences
     */
    getRequiredTags(preferences: string[]): string[] {
        const tags: string[] = [];

        for (const pref of preferences) {
            const preference = this.getPreference(pref);
            if (preference) {
                tags.push(...preference.requiredTags);
            }
        }

        return [...new Set(tags)];
    }
}
