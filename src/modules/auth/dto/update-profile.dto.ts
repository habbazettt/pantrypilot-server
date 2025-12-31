import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
    @ApiProperty({
        description: 'User display name',
        example: 'John Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Current password (required if changing password)',
        example: 'oldPassword123',
        required: false,
    })
    @IsString()
    @ValidateIf((o) => o.newPassword)
    currentPassword?: string;

    @ApiProperty({
        description: 'New password (minimum 6 characters)',
        example: 'newPassword123',
        required: false,
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    @IsOptional()
    newPassword?: string;
}
