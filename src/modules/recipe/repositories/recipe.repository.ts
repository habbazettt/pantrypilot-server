import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities';

@Injectable()
export class RecipeRepository {
    constructor(
        @InjectRepository(Recipe)
        private readonly repository: Repository<Recipe>,
    ) { }

    async findAll(): Promise<Recipe[]> {
        return this.repository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Recipe | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByFingerprint(fingerprint: string): Promise<Recipe[]> {
        return this.repository.find({
            where: { inputFingerprint: fingerprint },
            order: { createdAt: 'DESC' },
        });
    }

    async create(data: Partial<Recipe>): Promise<Recipe> {
        const recipe = this.repository.create(data);
        return this.repository.save(recipe);
    }

    async createMany(recipes: Partial<Recipe>[]): Promise<Recipe[]> {
        const entities = recipes.map((r) => this.repository.create(r));
        return this.repository.save(entities);
    }

    async update(id: string, data: Partial<Recipe>): Promise<Recipe | null> {
        await this.repository.update(id, data);
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    async updateRating(id: string, newRating: number): Promise<Recipe | null> {
        const recipe = await this.findById(id);
        if (!recipe) return null;

        const totalRating = recipe.rating * recipe.ratingCount + newRating;
        const newCount = recipe.ratingCount + 1;
        const averageRating = totalRating / newCount;

        return this.update(id, {
            rating: Math.round(averageRating * 10) / 10,
            ratingCount: newCount,
        });
    }

    async findSaved(sessionId?: string): Promise<Recipe[]> {
        const where: any = { isSaved: true };
        if (sessionId) {
            where.sessionId = sessionId;
        }
        return this.repository.find({
            where,
            order: { updatedAt: 'DESC' },
        });
    }

    async setSaved(id: string, isSaved: boolean, sessionId?: string): Promise<Recipe | null> {
        const updateData: Partial<Recipe> = { isSaved };
        if (sessionId && isSaved) {
            updateData.sessionId = sessionId;
        }
        return this.update(id, updateData);
    }

    async findBySessionId(sessionId: string): Promise<Recipe[]> {
        return this.repository.find({
            where: { sessionId },
            order: { createdAt: 'DESC' },
        });
    }

    async findAllWithEmbeddings(): Promise<Recipe[]> {
        return this.repository
            .createQueryBuilder('recipe')
            .where('recipe.embedding IS NOT NULL')
            .getMany();
    }

    async search(params: {
        q?: string;
        difficulty?: string;
        maxTime?: number;
        tags?: string[];
        sortBy?: string;
        order?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
    }): Promise<{ data: Recipe[]; total: number }> {
        const qb = this.repository.createQueryBuilder('recipe');

        // Full-text search on title and description
        if (params.q) {
            qb.andWhere(
                '(LOWER(recipe.title) LIKE LOWER(:q) OR LOWER(recipe.description) LIKE LOWER(:q))',
                { q: `%${params.q}%` },
            );
        }

        // Filter by difficulty
        if (params.difficulty) {
            qb.andWhere('recipe.difficulty = :difficulty', {
                difficulty: params.difficulty,
            });
        }

        // Filter by max cooking time
        if (params.maxTime) {
            qb.andWhere('recipe.estimatedTime <= :maxTime', {
                maxTime: params.maxTime,
            });
        }

        // Filter by tags (simple-array contains check)
        if (params.tags && params.tags.length > 0) {
            // For simple-array, we check if any of the tags are present
            const tagConditions = params.tags.map((_, idx) =>
                `recipe.tags LIKE :tag${idx}`
            );
            const tagParams: Record<string, string> = {};
            params.tags.forEach((tag, idx) => {
                tagParams[`tag${idx}`] = `%${tag}%`;
            });
            qb.andWhere(`(${tagConditions.join(' OR ')})`, tagParams);
        }

        // Get total count before pagination
        const total = await qb.getCount();

        // Sorting
        const sortField = params.sortBy || 'createdAt';
        const sortOrder = (params.order?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';
        qb.orderBy(`recipe.${sortField}`, sortOrder);

        // Pagination
        if (params.limit) {
            qb.take(params.limit);
        }
        if (params.offset) {
            qb.skip(params.offset);
        }

        const data = await qb.getMany();

        return { data, total };
    }
}