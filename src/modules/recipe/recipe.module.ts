import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities';
import { RecipeRepository } from './repositories';
import { RecipeService, GeminiService } from './services';
import { RecipeController } from './controllers';

@Module({
    imports: [TypeOrmModule.forFeature([Recipe])],
    controllers: [RecipeController],
    providers: [RecipeRepository, RecipeService, GeminiService],
    exports: [RecipeService],
})
export class RecipeModule { }
