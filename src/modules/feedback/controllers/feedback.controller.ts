import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import * as express from 'express';
import { FeedbackService } from '../services';
import { CreateFeedbackDto, FeedbackResponseDto, AggregatedFeedbackDto } from '../dto';

@ApiTags('feedback')
@Controller('recipes')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post(':id/feedback')
    @ApiOperation({
        summary: 'Submit feedback for a recipe',
        description: 'Rate a recipe, leave a comment, or suggest corrections',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({
        status: 201,
        description: 'Feedback submitted successfully',
        type: FeedbackResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input or already rated' })
    @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
    async createFeedback(
        @Param('id') recipeId: string,
        @Body() dto: CreateFeedbackDto,
        @Req() req: express.Request,
    ): Promise<FeedbackResponseDto> {
        return this.feedbackService.createFeedback(
            recipeId,
            dto,
            (req as any).sessionToken,
        );
    }

    @Get(':id/feedback')
    @ApiOperation({
        summary: 'Get aggregated feedback for a recipe',
        description: 'Returns average rating, rating distribution, and recent comments',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({
        status: 200,
        description: 'Aggregated feedback data',
        type: AggregatedFeedbackDto,
    })
    async getAggregatedFeedback(
        @Param('id') recipeId: string,
    ): Promise<AggregatedFeedbackDto> {
        return this.feedbackService.getAggregatedFeedback(recipeId);
    }
}
