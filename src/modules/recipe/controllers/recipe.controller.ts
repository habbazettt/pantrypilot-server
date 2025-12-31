import { Controller, Get, Post, Delete, Body, Param, Req, Res, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import * as express from 'express';
import { RecipeService } from '../services';
import { JwtAuthGuard } from '../../auth/guards';
import {
    GenerateRecipeDto,
    GenerateRecipeResponseDto,
    RecipeResponseDto,
    SaveRecipeDto,
    AlternativesQueryDto,
    SearchRecipeDto,
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

    @Get('cuisines')
    @ApiOperation({
        summary: 'Get available cuisines',
        description: 'Get list of supported cuisines for recipe generation',
    })
    @ApiResponse({
        status: 200,
        description: 'List of cuisines',
        schema: {
            example: ['indonesian', 'japanese', 'italian'],
        },
    })
    getCuisines(): string[] {
        return Object.values(require('../entities').Cuisine);
    }

    // IMPORTANT: /search MUST come BEFORE /:id to avoid route conflict
    @Get('search')
    @ApiOperation({
        summary: 'Search recipes',
        description: 'Search recipes with full-text search, filters, sorting, and pagination',
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated search results',
    })
    async search(@Query() query: SearchRecipeDto): Promise<{
        data: RecipeResponseDto[];
        total: number;
        limit: number;
        offset: number;
    }> {
        return this.recipeService.search({
            q: query.q,
            difficulty: query.difficulty,
            maxTime: query.maxTime,
            tags: query.tags,
            sortBy: query.sortBy,
            order: query.order,
            limit: query.limit,
            offset: query.offset,
        });
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

    // ===== SOCIAL SHARING ENDPOINTS =====

    @Get('shared/:shareId')
    @SkipThrottle()
    @ApiOperation({
        summary: 'Get shared recipe (public)',
        description: 'Access a shared recipe publicly using its share ID. No authentication required.',
    })
    @ApiParam({ name: 'shareId', description: 'Short share ID (12 chars)' })
    @ApiResponse({
        status: 200,
        description: 'Shared recipe found',
        type: RecipeResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Shared recipe not found' })
    async findByShareId(@Param('shareId') shareId: string): Promise<RecipeResponseDto> {
        const recipe = await this.recipeService.findByShareId(shareId);
        if (!recipe) {
            throw new NotFoundException(`Shared recipe not found`);
        }
        return recipe;
    }

    @Get(':id/share')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Generate share link',
        description: 'Generate a shareable link for a recipe. Requires authentication.',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Share link generated',
        schema: {
            example: {
                shareId: 'abc123xyz456',
                shareUrl: 'https://example.com/r/abc123xyz456',
                ogImageUrl: 'https://example.com/api/recipes/shared/abc123xyz456/og-image',
                createdAt: '2024-01-15T10:30:00Z',
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Recipe not found' })
    async generateShareLink(
        @Param('id') id: string,
        @Req() req: any,
    ): Promise<{ shareId: string; shareUrl: string; ogImageUrl: string; createdAt: Date }> {
        // Get base URL from request
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        const result = await this.recipeService.generateShareLink(id, baseUrl);
        if (!result) {
            throw new NotFoundException(`Recipe with ID ${id} not found`);
        }
        return result;
    }

    @Get('shared/:shareId/og-image')
    @SkipThrottle()
    @ApiOperation({
        summary: 'Get OG image for shared recipe',
        description: 'Dynamically generate Open Graph image for social media preview. No authentication required.',
    })
    @ApiParam({ name: 'shareId', description: 'Short share ID (12 chars)' })
    @ApiResponse({
        status: 200,
        description: 'OG image PNG',
        content: { 'image/png': {} },
    })
    @ApiResponse({ status: 404, description: 'Shared recipe not found' })
    async getOgImage(
        @Param('shareId') shareId: string,
        @Req() _req: any,
        @Res() res: express.Response,
    ): Promise<void> {
        const recipe = await this.recipeService.getRecipeByShareId(shareId);
        if (!recipe) {
            throw new NotFoundException(`Shared recipe not found`);
        }

        // Generate OG image using Sharp
        const sharp = (await import('sharp')).default;

        const width = 1200;
        const height = 630;

        // Escape HTML entities for SVG safety
        const escapeHtml = (str: string) => str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        const title = escapeHtml(recipe.title.slice(0, 50) + (recipe.title.length > 50 ? '...' : ''));
        const description = escapeHtml((recipe.description || '').slice(0, 100) + ((recipe.description || '').length > 100 ? '...' : ''));
        const time = recipe.estimatedTime;
        const rating = recipe.rating ? recipe.rating.toFixed(1) : 'New';

        const svgImage = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bg)"/>
                
                <!-- Logo area -->
                <text x="60" y="80" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#4ade80">
                    🍳 PantryPilot
                </text>
                
                <!-- Title -->
                <text x="60" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">
                    ${title}
                </text>
                
                <!-- Stats -->
                <text x="60" y="280" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8">
                    ⏱ ${time} mins  |  ⭐ ${rating}
                </text>
                
                <!-- Description -->
                <text x="60" y="360" font-family="Arial, sans-serif" font-size="20" fill="#64748b">
                    ${description}
                </text>
                
                <!-- Footer -->
                <text x="60" y="580" font-family="Arial, sans-serif" font-size="18" fill="#475569">
                    Share your cooking journey
                </text>
            </svg>
        `;

        const pngBuffer = await sharp(Buffer.from(svgImage))
            .png()
            .toBuffer();

        res.set({
            'Content-Type': 'image/png',
            'Content-Length': pngBuffer.length,
            'Cache-Control': 'public, max-age=86400',
        });
        res.send(pngBuffer);
    }
}
