import { IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name: string;

  // Optional empty string is allowed
  @IsString()
  description?: string;
}
