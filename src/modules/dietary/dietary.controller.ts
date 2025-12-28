import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DietaryService, DietaryPreference } from './dietary.service';

@ApiTags('dietary')
@Controller('dietary')
export class DietaryController {
    constructor(private readonly dietaryService: DietaryService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all dietary preferences',
        description: 'Returns a list of supported dietary preferences with their rules',
    })
    @ApiResponse({
        status: 200,
        description: 'List of dietary preferences',
    })
    getAllPreferences(): Record<string, DietaryPreference> {
        return this.dietaryService.getAllPreferences();
    }

    @Get('names')
    @ApiOperation({
        summary: 'Get dietary preference names',
        description: 'Returns a list of supported dietary preference names for use in API calls',
    })
    @ApiResponse({
        status: 200,
        description: 'List of preference names',
        type: [String],
    })
    getPreferenceNames(): string[] {
        return this.dietaryService.getPreferenceNames();
    }
}
