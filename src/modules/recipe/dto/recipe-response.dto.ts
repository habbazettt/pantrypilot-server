import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecipeDifficulty } from '../entities';

export class RecipeResponseDto {
    @ApiProperty({ example: 'uuid-here' })
    id: string;

    @ApiProperty({ example: 'Ayam Kecap Manis' })
    title: string;

    @ApiPropertyOptional({ example: 'Resep ayam kecap manis yang lezat dan mudah dibuat' })
    description?: string;

    @ApiProperty({ example: ['500g ayam', '3 siung bawang putih', '2 sdm kecap manis'] })
    ingredients: string[];

    @ApiProperty({
        example: [
            'Potong ayam menjadi bagian-bagian kecil',
            'Haluskan bawang putih dan jahe',
            'Tumis bumbu hingga harum',
            'Masukkan ayam, aduk hingga berubah warna',
            'Tambahkan kecap manis, masak hingga matang',
        ],
    })
    steps: string[];

    @ApiProperty({ example: 30 })
    estimatedTime: number;

    @ApiProperty({ enum: RecipeDifficulty, example: RecipeDifficulty.EASY })
    difficulty: RecipeDifficulty;

    @ApiPropertyOptional({ example: ['Pastikan ayam sudah matang sempurna'] })
    safetyNotes?: string[];

    @ApiPropertyOptional({ example: ['indonesian', 'chicken', 'quick'] })
    tags?: string[];

    @ApiPropertyOptional({ example: 4.5 })
    rating?: number;

    @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
    createdAt: Date;
}

export class GenerateRecipeResponseDto {
    @ApiProperty({ type: [RecipeResponseDto] })
    recipes: RecipeResponseDto[];

    @ApiProperty({ example: false })
    cached: boolean;

    @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
    generatedAt: string;

    @ApiPropertyOptional({ example: 'abc123fingerprint' })
    fingerprint?: string;
}
