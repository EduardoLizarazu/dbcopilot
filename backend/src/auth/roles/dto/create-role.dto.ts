import { IsNumber, IsString } from 'class-validator';
// Swagger
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;

  // allow null or empty string
  @ApiProperty({ type: [Number], required: false })
  @IsNumber()
  permissions?: number[]; // Array of permission IDs
}
