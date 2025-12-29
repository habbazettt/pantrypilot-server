import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from '../services';
import { CreateFeedbackDto, FeedbackResponseDto, AggregatedFeedbackDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards';

@ApiTags('feedback')
@Controller('recipes')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post(':id/feedback')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Submit feedback for a recipe',
        description: 'Rate a recipe, leave a comment, or suggest corrections. Requires authentication.',
    })
    @ApiParam({ name: 'id', description: 'Recipe ID (UUID)' })
    @ApiResponse({
        status: 201,
        description: 'Feedback submitted successfully',
        type: FeedbackResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid input or already rated' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
    async createFeedback(
        @Param('id') recipeId: string,
        @Body() dto: CreateFeedbackDto,
        @Req() req: any,
    ): Promise<FeedbackResponseDto> {
        return this.feedbackService.createFeedback(
            recipeId,
            dto,
            req.user.userId,
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
