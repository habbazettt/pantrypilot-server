import { ApiProperty } from '@nestjs/swagger';

export class FeedbackResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    recipeId: string;

    @ApiProperty()
    type: string;

    @ApiProperty({ nullable: true })
    rating: number | null;

    @ApiProperty({ nullable: true })
    comment: string | null;

    @ApiProperty()
    createdAt: Date;
}

export class AggregatedFeedbackDto {
    @ApiProperty({ description: 'Recipe ID' })
    recipeId: string;

    @ApiProperty({ description: 'Average rating (1-5)' })
    averageRating: number;

    @ApiProperty({ description: 'Total number of ratings' })
    totalRatings: number;

    @ApiProperty({ description: 'Rating distribution', example: { 1: 2, 2: 5, 3: 10, 4: 20, 5: 15 } })
    ratingDistribution: Record<number, number>;

    @ApiProperty({ description: 'Recent comments', type: [FeedbackResponseDto] })
    recentComments: FeedbackResponseDto[];
}
