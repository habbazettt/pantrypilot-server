import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlternativesQueryDto {
    @ApiProperty({
        description: 'Comma-separated list of ingredients you have',
        example: 'ayam,bawang putih,jahe',
    })
    @IsString()
    ingredients: string;

    @ApiPropertyOptional({
        description: 'Comma-separated dietary restrictions or allergies to avoid',
        example: 'kacang,seafood',
    })
    @IsOptional()
    @IsString()
    allergies?: string;

    @ApiPropertyOptional({
        description: 'Comma-separated dietary preferences',
        example: 'halal,vegetarian',
    })
    @IsOptional()
    @IsString()
    preferences?: string;

    @ApiPropertyOptional({
        description: 'Maximum number of results',
        example: '5',
    })
    @IsOptional()
    @IsString()
    limit?: string;
}
