import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeDifficulty } from '../entities';

export enum SortBy {
    CREATED_AT = 'createdAt',
    RATING = 'rating',
    ESTIMATED_TIME = 'estimatedTime',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class SearchRecipeDto {
    @ApiPropertyOptional({
        description: 'Search query for title and description',
        example: 'chicken',
    })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Filter by difficulty level',
        enum: RecipeDifficulty,
        example: RecipeDifficulty.EASY,
    })
    @IsOptional()
    @IsEnum(RecipeDifficulty)
    difficulty?: RecipeDifficulty;

    @ApiPropertyOptional({
        description: 'Maximum cooking time in minutes',
        example: 30,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    maxTime?: number;

    @ApiPropertyOptional({
        description: 'Comma-separated tags to filter by',
        example: 'healthy,quick',
    })
    @IsOptional()
    @IsString()
    tags?: string;

    @ApiPropertyOptional({
        description: 'Field to sort by',
        enum: SortBy,
        default: SortBy.CREATED_AT,
    })
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.CREATED_AT;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        default: SortOrder.DESC,
    })
    @IsOptional()
    @IsEnum(SortOrder)
    order?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({
        description: 'Number of results to return',
        default: 10,
        minimum: 1,
        maximum: 50,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Number of results to skip',
        default: 0,
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}

export interface SearchResult<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}
