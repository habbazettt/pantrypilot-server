import { IsEnum, IsInt, IsOptional, IsString, Max, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FeedbackType } from '../entities';

export class CorrectionDto {
    @ApiProperty({ description: 'Field name to correct', example: 'ingredients' })
    @IsString()
    field: string;

    @ApiProperty({ description: 'Original value', example: '2 sdm garam' })
    @IsString()
    originalValue: string;

    @ApiProperty({ description: 'Suggested correction', example: '1 sdt garam' })
    @IsString()
    suggestedValue: string;
}

export class CreateFeedbackDto {
    @ApiPropertyOptional({
        description: 'Type of feedback',
        enum: FeedbackType,
        default: FeedbackType.RATING,
    })
    @IsOptional()
    @IsEnum(FeedbackType)
    type?: FeedbackType;

    @ApiPropertyOptional({
        description: 'Rating from 1 to 5',
        example: 4,
        minimum: 1,
        maximum: 5,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({
        description: 'Optional comment or feedback text',
        example: 'Resep ini enak tapi sedikit terlalu asin',
    })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiPropertyOptional({
        description: 'Suggested corrections for the recipe',
        type: [CorrectionDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CorrectionDto)
    corrections?: CorrectionDto[];
}
