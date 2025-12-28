import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, FeedbackType } from '../entities';

@Injectable()
export class FeedbackRepository {
    constructor(
        @InjectRepository(Feedback)
        private readonly repository: Repository<Feedback>,
    ) { }

    async create(data: Partial<Feedback>): Promise<Feedback> {
        const feedback = this.repository.create(data);
        return this.repository.save(feedback);
    }

    async findByRecipeId(recipeId: string): Promise<Feedback[]> {
        return this.repository.find({
            where: { recipeId },
            order: { createdAt: 'DESC' },
        });
    }

    async findByRecipeIdAndSession(recipeId: string, sessionId: string): Promise<Feedback | null> {
        return this.repository.findOne({
            where: { recipeId, sessionId, type: FeedbackType.RATING },
        });
    }

    async getAggregatedRatings(recipeId: string): Promise<{
        averageRating: number;
        totalRatings: number;
        distribution: Record<number, number>;
    }> {
        const ratings = await this.repository.find({
            where: { recipeId, type: FeedbackType.RATING },
            select: ['rating'],
        });

        if (ratings.length === 0) {
            return { averageRating: 0, totalRatings: 0, distribution: {} };
        }

        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;

        for (const r of ratings) {
            if (r.rating) {
                sum += r.rating;
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
            }
        }

        return {
            averageRating: Math.round((sum / ratings.length) * 10) / 10,
            totalRatings: ratings.length,
            distribution,
        };
    }

    async getRecentComments(recipeId: string, limit: number = 5): Promise<Feedback[]> {
        return this.repository.find({
            where: { recipeId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async countBySessionToday(sessionId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.repository
            .createQueryBuilder('feedback')
            .where('feedback.sessionId = :sessionId', { sessionId })
            .andWhere('feedback.createdAt >= :today', { today })
            .getCount();
    }
}
