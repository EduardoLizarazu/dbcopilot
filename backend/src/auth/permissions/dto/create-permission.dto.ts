import { IsString } from 'class-validator';
// Swagger
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty()
  @IsString()
  name: string;

  // Optional empty string is allowed
  @ApiProperty({ required: false })
  @IsString()
  description?: string;
}
