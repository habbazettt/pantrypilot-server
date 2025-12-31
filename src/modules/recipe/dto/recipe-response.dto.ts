import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecipeDifficulty, Cuisine } from '../entities';

export class RecipeResponseDto {
    @ApiProperty({ example: 'uuid-here' })
    id: string;

    @ApiProperty({ example: 'Sweet Soy Chicken' })
    title: string;

    @ApiPropertyOptional({ example: 'Delicious and easy sweet soy chicken recipe' })
    description?: string;

    @ApiProperty({ example: ['500g chicken', '3 cloves garlic', '2 tbsp sweet soy sauce'] })
    ingredients: string[];

    @ApiProperty({
        example: [
            'Cut chicken into small pieces',
            'Crush garlic and ginger',
            'Sauté spices until fragrant',
            'Add chicken, stir until color changes',
            'Add sweet soy sauce, cook until done',
        ],
    })
    steps: string[];

    @ApiProperty({ example: 30 })
    estimatedTime: number;

    @ApiProperty({ enum: RecipeDifficulty, example: RecipeDifficulty.EASY })
    difficulty: RecipeDifficulty;

    @ApiPropertyOptional({ example: ['Ensure chicken is cooked thoroughly'] })
    safetyNotes?: string[];

    @ApiPropertyOptional({ example: ['indonesian', 'chicken', 'quick'] })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Cuisine style',
        enum: Cuisine,
        example: Cuisine.INDONESIAN,
    })
    cuisine?: Cuisine;

    @ApiPropertyOptional({ example: 4.5 })
    rating?: number;

    @ApiPropertyOptional({ example: 42, description: 'Number of reviews/ratings for this recipe' })
    reviewCount?: number;

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
