import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AllergenService, AllergenCategory } from './allergen.service';

@ApiTags('allergens')
@Controller('allergens')
export class AllergenController {
    constructor(private readonly allergenService: AllergenService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all allergen categories',
        description: 'Returns a list of common allergens grouped by category for user reference',
    })
    @ApiResponse({
        status: 200,
        description: 'List of allergen categories with allergen details',
    })
    getAllAllergens(): AllergenCategory[] {
        return this.allergenService.getAllAllergens();
    }

    @Get('names')
    @ApiOperation({
        summary: 'Get all allergen names',
        description: 'Returns a flat list of all allergen names and their aliases',
    })
    @ApiResponse({
        status: 200,
        description: 'List of allergen names',
        type: [String],
    })
    getAllAllergenNames(): string[] {
        return this.allergenService.getAllAllergenNames();
    }
}
