import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsNull } from 'typeorm';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  // apply more rules for password as you see fit
  password: string;

  @IsString()
  name: string;

  @IsArray()
  roles: Role[];
}

class Role {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  permissions: Permission[];
}

class Permission {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  isActive: boolean;
}
