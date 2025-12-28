import { Controller, Get, Post, Delete, Body, Param, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import express from 'express';
import { RecipeService } from '../services';
import {
    GenerateRecipeDto,
    GenerateRecipeResponseDto,
    RecipeResponseDto,
    SaveRecipeDto,
} from '../dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) { }

    @Post('generate')
    @ApiOperation({
        summary: 'Generate recipes from ingredients',
        description: 'Generate 1-3 recipe suggestions based on provided ingredients using AI',
    })
    @ApiResponse({
        status: 201,
        description: 'Recipes generated successfully',
        type: GenerateRecipeResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async generateRecipes(
        @Body() dto: GenerateRecipeDto,
    ): Promise<GenerateRecipeResponseDto> {
        return this.recipeService.generateRecipes(dto);
    }

    @Post('save')
    @ApiOperation({
        summary: 'Save/bookmark a recipe',
        description: 'Mark a recipe as saved/bookmarked for later access',
    })
    @ApiResponse({
        status: 201,
        description: 'Recipe saved successfully',
        type: RecipeResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async saveRecipe(@Body() dto: SaveRecipeDto): Promise<RecipeResponseDto> {
        const recipe = await this.recipeService.saveRecipe(dto.recipeId);
        if (!recipe) {
            throw new NotFoundException(`Recipe with ID ${dto.recipeId} not found`);
        }
        return recipe;
    }

    @Get('saved')
    @ApiOperation({
        summary: 'Get all saved/bookmarked recipes',
        description: 'Retrieve all recipes that have been saved/bookmarked for current session',
    })
    @ApiResponse({
        status: 200,
        description: 'List of saved recipes',
        type: [RecipeResponseDto],
    })
    async findSaved(@Req() req: express.Request): Promise<RecipeResponseDto[]> {
        return this.recipeService.findSaved(req.sessionToken);
    }

    @Delete('saved/:id')
    @ApiOperation({
        summary: 'Remove bookmark from a recipe',
        description: 'Unsave/remove bookmark from a recipe',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({ status: 200, description: 'Recipe unsaved successfully' })
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
}
