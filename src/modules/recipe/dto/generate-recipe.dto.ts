import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecipeDifficulty } from '../entities';

export class GenerateRecipeDto {
    @ApiProperty({
        description: 'List of ingredients available',
        example: ['ayam', 'bawang putih', 'kecap manis', 'jahe'],
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
        example: ['kacang', 'seafood'],
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
}
