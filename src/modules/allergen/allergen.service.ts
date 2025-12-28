import { Injectable, Logger } from '@nestjs/common';

export interface AllergenInfo {
    name: string;
    aliases: string[];
    description: string;
    severity: 'high' | 'medium' | 'low';
}

export interface AllergenCategory {
    category: string;
    allergens: AllergenInfo[];
}

@Injectable()
export class AllergenService {
    private readonly logger = new Logger(AllergenService.name);

    /**
     * Common allergens database with aliases and variants
     */
    private readonly allergenDatabase: AllergenCategory[] = [
        {
            category: 'Kacang-kacangan',
            allergens: [
                {
                    name: 'kacang tanah',
                    aliases: ['peanut', 'kacang', 'selai kacang', 'minyak kacang', 'kacang goreng'],
                    description: 'Alergen umum yang dapat menyebabkan reaksi berat',
                    severity: 'high',
                },
                {
                    name: 'kacang mete',
                    aliases: ['cashew', 'mete', 'kacang mede'],
                    description: 'Tree nut allergen',
                    severity: 'high',
                },
                {
                    name: 'kacang almond',
                    aliases: ['almond', 'badam'],
                    description: 'Tree nut allergen',
                    severity: 'high',
                },
                {
                    name: 'kacang kenari',
                    aliases: ['walnut', 'kenari'],
                    description: 'Tree nut allergen',
                    severity: 'high',
                },
                {
                    name: 'kacang kedelai',
                    aliases: ['soy', 'kedelai', 'tahu', 'tempe', 'kecap', 'tauco', 'miso', 'edamame'],
                    description: 'Legume allergen, common in Asian cuisine',
                    severity: 'medium',
                },
            ],
        },
        {
            category: 'Seafood',
            allergens: [
                {
                    name: 'udang',
                    aliases: ['shrimp', 'prawn', 'ebi', 'udang galah', 'udang windu'],
                    description: 'Shellfish allergen',
                    severity: 'high',
                },
                {
                    name: 'kepiting',
                    aliases: ['crab', 'rajungan', 'kepiting soka'],
                    description: 'Shellfish allergen',
                    severity: 'high',
                },
                {
                    name: 'lobster',
                    aliases: ['lobster'],
                    description: 'Shellfish allergen',
                    severity: 'high',
                },
                {
                    name: 'kerang',
                    aliases: ['clam', 'shellfish', 'kupang', 'simping', 'kerang hijau', 'kerang dara'],
                    description: 'Mollusk allergen',
                    severity: 'high',
                },
                {
                    name: 'cumi',
                    aliases: ['squid', 'cumi-cumi', 'sotong'],
                    description: 'Mollusk allergen',
                    severity: 'medium',
                },
                {
                    name: 'gurita',
                    aliases: ['octopus', 'gurita'],
                    description: 'Mollusk allergen',
                    severity: 'medium',
                },
                {
                    name: 'ikan',
                    aliases: ['fish', 'salmon', 'tuna', 'tenggiri', 'kakap', 'patin', 'lele', 'nila', 'bandeng', 'teri', 'ikan asin'],
                    description: 'Fish allergen',
                    severity: 'high',
                },
            ],
        },
        {
            category: 'Dairy',
            allergens: [
                {
                    name: 'susu',
                    aliases: ['milk', 'dairy', 'susu sapi', 'krim', 'cream', 'whey', 'kasein', 'laktosa'],
                    description: 'Dairy/lactose allergen',
                    severity: 'medium',
                },
                {
                    name: 'keju',
                    aliases: ['cheese', 'parmesan', 'mozzarella', 'cheddar'],
                    description: 'Dairy allergen',
                    severity: 'medium',
                },
                {
                    name: 'mentega',
                    aliases: ['butter', 'margarin'],
                    description: 'Dairy allergen',
                    severity: 'medium',
                },
                {
                    name: 'yogurt',
                    aliases: ['yoghurt', 'yogurt'],
                    description: 'Dairy allergen',
                    severity: 'medium',
                },
            ],
        },
        {
            category: 'Gluten',
            allergens: [
                {
                    name: 'gandum',
                    aliases: ['wheat', 'terigu', 'tepung terigu', 'roti', 'pasta', 'mie'],
                    description: 'Gluten/wheat allergen',
                    severity: 'medium',
                },
                {
                    name: 'barley',
                    aliases: ['barley', 'jelai'],
                    description: 'Gluten allergen',
                    severity: 'medium',
                },
                {
                    name: 'oat',
                    aliases: ['oat', 'haver', 'oatmeal'],
                    description: 'May contain gluten',
                    severity: 'low',
                },
            ],
        },
        {
            category: 'Telur',
            allergens: [
                {
                    name: 'telur',
                    aliases: ['egg', 'telur ayam', 'telur bebek', 'telur puyuh', 'kuning telur', 'putih telur'],
                    description: 'Egg allergen',
                    severity: 'medium',
                },
            ],
        },
        {
            category: 'Lainnya',
            allergens: [
                {
                    name: 'wijen',
                    aliases: ['sesame', 'bijan', 'minyak wijen'],
                    description: 'Sesame allergen',
                    severity: 'medium',
                },
                {
                    name: 'mustard',
                    aliases: ['mustard', 'sawi'],
                    description: 'Mustard allergen',
                    severity: 'low',
                },
                {
                    name: 'seledri',
                    aliases: ['celery', 'daun seledri'],
                    description: 'Celery allergen',
                    severity: 'low',
                },
            ],
        },
    ];

    /**
     * Get all allergen categories
     */
    getAllAllergens(): AllergenCategory[] {
        return this.allergenDatabase;
    }

    /**
     * Get flat list of all allergen names
     */
    getAllAllergenNames(): string[] {
        const names: string[] = [];
        for (const category of this.allergenDatabase) {
            for (const allergen of category.allergens) {
                names.push(allergen.name);
                names.push(...allergen.aliases);
            }
        }
        return [...new Set(names)];
    }

    /**
     * Check if text contains any allergens from user's list
     */
    containsAllergen(text: string, userAllergens: string[]): { found: boolean; matches: string[] } {
        const normalizedText = text.toLowerCase();
        const matches: string[] = [];

        for (const userAllergen of userAllergens) {
            const normalizedAllergen = userAllergen.toLowerCase().trim();

            // Direct match
            if (normalizedText.includes(normalizedAllergen)) {
                matches.push(userAllergen);
                continue;
            }

            // Check against allergen database aliases
            for (const category of this.allergenDatabase) {
                for (const allergen of category.allergens) {
                    const allNames = [allergen.name, ...allergen.aliases];

                    // Check if user's allergen matches any known allergen
                    const matchesKnownAllergen = allNames.some(
                        name => name.toLowerCase().includes(normalizedAllergen) ||
                            normalizedAllergen.includes(name.toLowerCase())
                    );

                    if (matchesKnownAllergen) {
                        // Check if the text contains any variant of this allergen
                        const foundInText = allNames.some(name =>
                            normalizedText.includes(name.toLowerCase())
                        );

                        if (foundInText) {
                            matches.push(userAllergen);
                            break;
                        }
                    }
                }
            }
        }

        return {
            found: matches.length > 0,
            matches: [...new Set(matches)],
        };
    }

    /**
     * Filter ingredients list against user's allergens
     */
    filterIngredients(
        ingredients: string[],
        userAllergens: string[],
    ): { safe: string[]; unsafe: string[]; warnings: string[] } {
        const safe: string[] = [];
        const unsafe: string[] = [];
        const warnings: string[] = [];

        for (const ingredient of ingredients) {
            const check = this.containsAllergen(ingredient, userAllergens);

            if (check.found) {
                unsafe.push(ingredient);
                warnings.push(`"${ingredient}" mengandung alergen: ${check.matches.join(', ')}`);
            } else {
                safe.push(ingredient);
            }
        }

        return { safe, unsafe, warnings };
    }

    /**
     * Validate recipe against user's allergens
     */
    validateRecipe(
        recipe: { title: string; ingredients: string[]; description?: string },
        userAllergens: string[],
    ): { isSafe: boolean; warnings: string[] } {
        if (userAllergens.length === 0) {
            return { isSafe: true, warnings: [] };
        }

        const allText = [
            recipe.title,
            recipe.description || '',
            ...recipe.ingredients,
        ].join(' ');

        const check = this.containsAllergen(allText, userAllergens);

        if (check.found) {
            return {
                isSafe: false,
                warnings: [`Resep ini mengandung alergen yang Anda hindari: ${check.matches.join(', ')}`],
            };
        }

        return { isSafe: true, warnings: [] };
    }
}
