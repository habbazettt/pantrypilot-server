import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RecipeService } from '../services';
import {
    GenerateRecipeDto,
    GenerateRecipeResponseDto,
    RecipeResponseDto,
} from '../dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) { }

    @Post('generate')
    @ApiOperation({
        summary: 'Generate recipes from ingredients',
        description: 'Generate 1-3 recipe suggestions based on provided ingredients',
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

    @Get()
    @ApiOperation({
        summary: 'Get all recipes',
        description: 'Retrieve all saved recipes',
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
