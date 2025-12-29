import { Controller, Get, Post, Delete, Body, Param, Req, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import * as express from 'express';
import { RecipeService } from '../services';
import { JwtAuthGuard } from '../../auth/guards';
import {
    GenerateRecipeDto,
    GenerateRecipeResponseDto,
    RecipeResponseDto,
    SaveRecipeDto,
    AlternativesQueryDto,
} from '../dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) { }

    @Post('generate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Generate recipes from ingredients',
        description: 'Generate 1-3 recipe suggestions based on provided ingredients using AI. Requires authentication.',
    })
    @ApiResponse({
        status: 201,
        description: 'Recipes generated successfully',
        type: GenerateRecipeResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async generateRecipes(
        @Body() dto: GenerateRecipeDto,
    ): Promise<GenerateRecipeResponseDto> {
        return this.recipeService.generateRecipes(dto);
    }

    @Post('save')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Save/bookmark a recipe',
        description: 'Mark a recipe as saved/bookmarked for later access. Requires authentication.',
    })
    @ApiResponse({
        status: 201,
        description: 'Recipe saved successfully',
        type: RecipeResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async saveRecipe(
        @Body() dto: SaveRecipeDto,
        @Req() req: any,
    ): Promise<RecipeResponseDto> {
        const recipe = await this.recipeService.saveRecipe(dto.recipeId, req.user.userId);
        if (!recipe) {
            throw new NotFoundException(`Recipe with ID ${dto.recipeId} not found`);
        }
        return recipe;
    }

    @Get('saved')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get all saved/bookmarked recipes',
        description: 'Retrieve all recipes that have been saved/bookmarked by the authenticated user.',
    })
    @ApiResponse({
        status: 200,
        description: 'List of saved recipes',
        type: [RecipeResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findSaved(@Req() req: any): Promise<RecipeResponseDto[]> {
        return this.recipeService.findSaved(req.user.userId);
    }

    @Delete('saved/:id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Remove bookmark from a recipe',
        description: 'Unsave/remove bookmark from a recipe. Requires authentication.',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Recipe unsaved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async unsaveRecipe(@Param('id') id: string): Promise<{ success: boolean }> {
        const result = await this.recipeService.unsaveRecipe(id);
        if (!result) {
            throw new NotFoundException(`Recipe with ID ${id} not found`);
        }
        return { success: true };
    }

    @Get()
    @ApiOperation({
        summary: 'Get all recipes',
        description: 'Retrieve all recipes (both saved and unsaved)',
    })
    @ApiResponse({
        status: 200,
        description: 'List of recipes',
        type: [RecipeResponseDto],
    })
    async findAll(): Promise<RecipeResponseDto[]> {
        return this.recipeService.findAll();
    }

    // IMPORTANT: /alternatives MUST come BEFORE /:id to avoid route conflict
    @Get('alternatives')
    @ApiOperation({
        summary: 'Get alternative recipes',
        description: 'Find recipes that can be made with ingredients you have, with substitution suggestions',
    })
    @ApiQuery({ name: 'ingredients', required: true, description: 'Comma-separated ingredients' })
    @ApiQuery({ name: 'allergies', required: false, description: 'Comma-separated allergies to avoid' })
    @ApiQuery({ name: 'preferences', required: false, description: 'Comma-separated dietary preferences' })
    @ApiQuery({ name: 'limit', required: false, description: 'Max results (default 5)' })
    @ApiResponse({
        status: 200,
        description: 'List of alternative recipes with match scores',
    })
    async findAlternatives(
        @Query() query: AlternativesQueryDto,
    ): Promise<{ recipes: RecipeResponseDto[]; matchScore: number }[]> {
        const ingredients = query.ingredients.split(',').map(i => i.trim()).filter(Boolean);
        const allergies = query.allergies?.split(',').map(i => i.trim()).filter(Boolean) || [];
        const preferences = query.preferences?.split(',').map(i => i.trim()).filter(Boolean) || [];
        const limit = parseInt(query.limit || '5', 10);

        return this.recipeService.findAlternatives(ingredients, allergies, preferences, limit);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get recipe by ID',
        description: 'Retrieve a specific recipe by its ID',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Recipe found',
        type: RecipeResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async findById(@Param('id') id: string): Promise<RecipeResponseDto> {
        const recipe = await this.recipeService.findById(id);
        if (!recipe) {
            throw new NotFoundException(`Recipe with ID ${id} not found`);
        }
        return recipe;
    }

    @Get(':id/similar')
    @ApiOperation({
        summary: 'Get similar recipes',
        description: 'Find recipes similar to the specified recipe based on embedding similarity',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'List of similar recipes',
        type: [RecipeResponseDto],
    })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async findSimilar(@Param('id') id: string): Promise<RecipeResponseDto[]> {
        return this.recipeService.findSimilarRecipes(id, 5);
    }
}
