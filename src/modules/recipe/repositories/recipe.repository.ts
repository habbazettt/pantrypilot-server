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
}
