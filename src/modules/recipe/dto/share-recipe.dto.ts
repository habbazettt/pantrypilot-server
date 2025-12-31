import { ApiProperty } from '@nestjs/swagger';

export class ShareRecipeResponseDto {
    @ApiProperty({ example: 'abc123xyz456', description: 'Short unique share ID' })
    shareId: string;

    @ApiProperty({ example: 'https://pantrypilot.app/r/abc123xyz456', description: 'Full shareable URL' })
    shareUrl: string;

    @ApiProperty({ example: 'https://pantrypilot.app/api/recipes/shared/abc123xyz456/og-image', description: 'OG image URL' })
    ogImageUrl: string;

    @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'When share was created' })
    createdAt: Date;
}
