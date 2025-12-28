import { Injectable, Logger } from '@nestjs/common';

export interface SafetyWarning {
    ingredient: string;
    aliases: string[];
    category: 'cooking' | 'storage' | 'allergy' | 'hygiene' | 'equipment';
    warning: string;
    severity: 'high' | 'medium' | 'low';
}

@Injectable()
export class SafetyService {
    private readonly logger = new Logger(SafetyService.name);

    /**
     * Ingredient-specific safety warnings database
     */
    private readonly safetyDatabase: SafetyWarning[] = [
        // Raw Meat
        {
            ingredient: 'daging ayam',
            aliases: ['ayam', 'chicken', 'daging ayam mentah', 'paha ayam', 'dada ayam', 'sayap ayam'],
            category: 'cooking',
            warning: 'Pastikan ayam dimasak hingga suhu internal minimal 74°C untuk membunuh bakteri Salmonella',
            severity: 'high',
        },
        {
            ingredient: 'daging sapi',
            aliases: ['sapi', 'beef', 'daging sapi mentah', 'has dalam', 'sirloin', 'tenderloin'],
            category: 'cooking',
            warning: 'Masak daging sapi hingga suhu internal minimal 63°C (medium) atau 71°C (well done)',
            severity: 'medium',
        },
        {
            ingredient: 'daging babi',
            aliases: ['babi', 'pork', 'bacon', 'ham'],
            category: 'cooking',
            warning: 'Pastikan babi dimasak hingga suhu internal minimal 71°C untuk menghindari parasit',
            severity: 'high',
        },
        {
            ingredient: 'daging kambing',
            aliases: ['kambing', 'lamb', 'mutton', 'domba'],
            category: 'cooking',
            warning: 'Masak daging kambing hingga matang sempurna, suhu internal minimal 63°C',
            severity: 'medium',
        },

        // Seafood
        {
            ingredient: 'udang',
            aliases: ['shrimp', 'prawn', 'udang galah', 'udang windu', 'ebi'],
            category: 'allergy',
            warning: 'Udang adalah alergen umum. Perhatikan tanda-tanda reaksi alergi. Masak hingga berwarna oranye-pink',
            severity: 'high',
        },
        {
            ingredient: 'kepiting',
            aliases: ['crab', 'rajungan', 'kepiting soka'],
            category: 'allergy',
            warning: 'Kepiting adalah alergen umum. Pastikan dimasak hingga cangkang berwarna merah cerah',
            severity: 'high',
        },
        {
            ingredient: 'kerang',
            aliases: ['shellfish', 'clam', 'mussel', 'kupang', 'kerang hijau'],
            category: 'hygiene',
            warning: 'Buang kerang yang tidak terbuka setelah dimasak. Kerang mentah berisiko kontaminasi bakteri',
            severity: 'high',
        },
        {
            ingredient: 'ikan mentah',
            aliases: ['sashimi', 'raw fish', 'ikan segar'],
            category: 'hygiene',
            warning: 'Konsumsi ikan mentah berisiko parasit. Pastikan ikan berkualitas sashimi-grade dan disimpan pada suhu sangat rendah',
            severity: 'high',
        },
        {
            ingredient: 'ikan',
            aliases: ['fish', 'salmon', 'tuna', 'tenggiri', 'kakap', 'patin', 'lele'],
            category: 'cooking',
            warning: 'Masak ikan hingga dagingnya mudah dipisahkan dengan garpu dan berwarna tidak transparan',
            severity: 'medium',
        },

        // Eggs
        {
            ingredient: 'telur',
            aliases: ['egg', 'telur ayam', 'telur bebek', 'telur mentah'],
            category: 'cooking',
            warning: 'Hindari konsumsi telur mentah atau setengah matang, terutama untuk anak-anak, lansia, dan ibu hamil',
            severity: 'medium',
        },

        // Dairy
        {
            ingredient: 'susu',
            aliases: ['milk', 'susu segar', 'dairy'],
            category: 'storage',
            warning: 'Simpan susu dalam lemari es dan konsumsi sebelum tanggal kedaluwarsa. Jangan biarkan di suhu ruang lebih dari 2 jam',
            severity: 'low',
        },

        // Vegetables that need attention
        {
            ingredient: 'singkong',
            aliases: ['cassava', 'ubi kayu', 'tapioka'],
            category: 'cooking',
            warning: 'Singkong mentah mengandung sianida. Pastikan dimasak dengan benar dan buang air rebusan pertama',
            severity: 'high',
        },
        {
            ingredient: 'jamur liar',
            aliases: ['wild mushroom', 'jamur hutan'],
            category: 'hygiene',
            warning: 'PERINGATAN: Hanya konsumsi jamur dari sumber terpercaya. Jamur liar beracun bisa sangat berbahaya',
            severity: 'high',
        },
        {
            ingredient: 'tauge',
            aliases: ['bean sprouts', 'kecambah'],
            category: 'hygiene',
            warning: 'Tauge rawan kontaminasi bakteri. Cuci bersih dan masak hingga matang',
            severity: 'medium',
        },

        // Equipment & General
        {
            ingredient: 'minyak goreng',
            aliases: ['oil', 'minyak', 'minyak panas', 'deep fry'],
            category: 'equipment',
            warning: 'Hati-hati dengan minyak panas. Jangan tinggalkan tanpa pengawasan dan siapkan penutup untuk api',
            severity: 'high',
        },
        {
            ingredient: 'pisau',
            aliases: ['knife', 'mengiris', 'memotong halus'],
            category: 'equipment',
            warning: 'Gunakan teknik memotong yang aman. Jaga jari menekuk ke dalam saat mengiris',
            severity: 'medium',
        },
        {
            ingredient: 'cabai',
            aliases: ['chili', 'cabe', 'cabai rawit', 'cabai merah'],
            category: 'hygiene',
            warning: 'Cuci tangan setelah mengolah cabai dan hindari menyentuh mata',
            severity: 'low',
        },
        {
            ingredient: 'bawang putih',
            aliases: ['garlic'],
            category: 'storage',
            warning: 'Bawang putih dalam minyak bisa menumbuhkan Clostridium botulinum jika tidak disimpan di lemari es',
            severity: 'low',
        },
    ];

    /**
     * General cooking safety tips
     */
    private readonly generalSafetyTips: string[] = [
        'Cuci tangan dengan sabun sebelum dan sesudah memasak',
        'Gunakan talenan berbeda untuk daging mentah dan sayuran',
        'Simpan bahan mentah terpisah dari makanan matang',
        'Jangan biarkan makanan di suhu ruang lebih dari 2 jam',
        'Pastikan semua peralatan masak bersih sebelum digunakan',
    ];

    /**
     * Get safety warnings for specific ingredients
     */
    getWarningsForIngredients(ingredients: string[]): SafetyWarning[] {
        const warnings: SafetyWarning[] = [];
        const ingredientText = ingredients.join(' ').toLowerCase();

        for (const safety of this.safetyDatabase) {
            const allTerms = [safety.ingredient, ...safety.aliases];
            const hasMatch = allTerms.some(term => ingredientText.includes(term.toLowerCase()));

            if (hasMatch && !warnings.some(w => w.ingredient === safety.ingredient)) {
                warnings.push(safety);
            }
        }

        return warnings;
    }

    /**
     * Generate safety notes for a recipe
     */
    generateSafetyNotes(
        ingredients: string[],
        steps: string[],
        existingSafetyNotes: string[] = [],
    ): string[] {
        const safetyNotes = [...existingSafetyNotes];
        const warnings = this.getWarningsForIngredients(ingredients);

        // Add ingredient-specific warnings
        for (const warning of warnings) {
            const newNote = warning.warning;
            if (!safetyNotes.some(note => note.toLowerCase().includes(warning.ingredient.toLowerCase()))) {
                safetyNotes.push(newNote);
            }
        }

        // Check steps for additional safety concerns
        const stepsText = steps.join(' ').toLowerCase();

        if (stepsText.includes('goreng') || stepsText.includes('deep fry')) {
            const oilWarning = 'Hati-hati saat menggoreng dengan minyak panas. Jangan tinggalkan tanpa pengawasan';
            if (!safetyNotes.some(n => n.includes('minyak panas'))) {
                safetyNotes.push(oilWarning);
            }
        }

        if (stepsText.includes('kukus') || stepsText.includes('steam')) {
            const steamWarning = 'Hati-hati dengan uap panas saat membuka tutup kukusan';
            if (!safetyNotes.some(n => n.includes('uap'))) {
                safetyNotes.push(steamWarning);
            }
        }

        if (stepsText.includes('oven') || stepsText.includes('panggang')) {
            const ovenWarning = 'Gunakan sarung tangan tahan panas saat menggunakan oven';
            if (!safetyNotes.some(n => n.includes('oven') || n.includes('sarung tangan'))) {
                safetyNotes.push(ovenWarning);
            }
        }

        // If no specific warnings, add a general tip
        if (safetyNotes.length === 0) {
            safetyNotes.push(this.generalSafetyTips[Math.floor(Math.random() * this.generalSafetyTips.length)]);
        }

        return safetyNotes;
    }

    /**
     * Get high severity warnings only
     */
    getHighSeverityWarnings(ingredients: string[]): SafetyWarning[] {
        const warnings = this.getWarningsForIngredients(ingredients);
        return warnings.filter(w => w.severity === 'high');
    }

    /**
     * Get all safety tips
     */
    getAllSafetyTips(): string[] {
        return this.generalSafetyTips;
    }
}
