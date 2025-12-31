import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecipeDifficulty, Cuisine } from '../entities';

export class GenerateRecipeDto {
    @ApiProperty({
        description: 'List of ingredients available',
        example: ['chicken', 'garlic', 'sweet soy sauce', 'ginger'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    ingredients: string[];

    @ApiPropertyOptional({
        description: 'Maximum cooking time in minutes',
        example: 30,
    })
    @IsOptional()
    maxTime?: number;

    @ApiPropertyOptional({
        description: 'Preferred difficulty level',
        enum: RecipeDifficulty,
        example: RecipeDifficulty.EASY,
    })
    @IsOptional()
    @IsEnum(RecipeDifficulty)
    difficulty?: RecipeDifficulty;

    @ApiPropertyOptional({
        description: 'Dietary restrictions or allergies to avoid',
        example: ['peanuts', 'seafood'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @ApiPropertyOptional({
        description: 'Dietary preferences',
        example: ['halal', 'vegetarian'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    preferences?: string[];

    @ApiPropertyOptional({
        description: 'Preferred cuisine style',
        enum: Cuisine,
        example: Cuisine.INDONESIAN,
    })
    @IsOptional()
    @IsEnum(Cuisine)
    cuisine?: Cuisine;
}
