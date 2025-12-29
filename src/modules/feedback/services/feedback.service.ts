import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { FeedbackRepository } from '../repositories';
import { CreateFeedbackDto, FeedbackResponseDto, AggregatedFeedbackDto } from '../dto';
import { Feedback, FeedbackType } from '../entities';

@Injectable()
export class FeedbackService {
    private readonly logger = new Logger(FeedbackService.name);
    private readonly MAX_FEEDBACK_PER_DAY = 20; // Rate limit

    constructor(private readonly feedbackRepository: FeedbackRepository) { }

    /**
     * Create feedback for a recipe
     */
    async createFeedback(
        recipeId: string,
        dto: CreateFeedbackDto,
        userId?: string,
    ): Promise<FeedbackResponseDto> {
        // Rate limiting check
        if (userId) {
            const todayCount = await this.feedbackRepository.countByUserToday(userId);
            if (todayCount >= this.MAX_FEEDBACK_PER_DAY) {
                throw new HttpException(
                    `You have reached the daily limit of ${this.MAX_FEEDBACK_PER_DAY} feedback submissions`,
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }

            // Check if user already rated this recipe (only for rating type)
            if (dto.type === FeedbackType.RATING || (!dto.type && dto.rating)) {
                const existingRating = await this.feedbackRepository.findByRecipeIdAndUser(
                    recipeId,
                    userId,
                );
                if (existingRating) {
                    throw new BadRequestException('You have already rated this recipe');
                }
            }
        }

        // Validate rating range
        if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        const feedback = await this.feedbackRepository.create({
            recipeId,
            userId,
            type: dto.type || (dto.rating ? FeedbackType.RATING : FeedbackType.COMMENT),
            rating: dto.rating,
            comment: dto.comment,
            corrections: dto.corrections,
        });

        this.logger.log(`Feedback created for recipe ${recipeId}: type=${feedback.type}`);
        return this.toResponseDto(feedback);
    }

    /**
     * Get aggregated feedback for a recipe
     */
    async getAggregatedFeedback(recipeId: string): Promise<AggregatedFeedbackDto> {
        const [aggregated, recentComments] = await Promise.all([
            this.feedbackRepository.getAggregatedRatings(recipeId),
            this.feedbackRepository.getRecentComments(recipeId, 5),
        ]);

        return {
            recipeId,
            averageRating: aggregated.averageRating,
            totalRatings: aggregated.totalRatings,
            ratingDistribution: aggregated.distribution,
            recentComments: recentComments.map(this.toResponseDto),
        };
    }

    /**
     * Get all feedback for a recipe
     */
    async getFeedbackByRecipe(recipeId: string): Promise<FeedbackResponseDto[]> {
        const feedbacks = await this.feedbackRepository.findByRecipeId(recipeId);
        return feedbacks.map(this.toResponseDto);
    }

    private toResponseDto(feedback: Feedback): FeedbackResponseDto {
        return {
            id: feedback.id,
            recipeId: feedback.recipeId,
            type: feedback.type,
            rating: feedback.rating,
            comment: feedback.comment,
            createdAt: feedback.createdAt,
        };
    }
}
