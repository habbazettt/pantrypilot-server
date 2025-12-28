import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveRecipeDto {
    @ApiProperty({
        description: 'Recipe ID to save/bookmark',
        example: 'uuid-here',
    })
    @IsUUID()
    @IsNotEmpty()
    recipeId: string;
}
