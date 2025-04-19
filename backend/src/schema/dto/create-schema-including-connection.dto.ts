import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class CreateSchemaIncludingConnectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  dbTypeId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dbName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dbHost: string;

  @ApiProperty()
  @IsNumber()
  dbPort: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dbUsername: string;

  @ApiProperty()
  @IsString()
  dbPassword?: string;

  @ApiProperty()
  @IsBoolean()
  is_connected: boolean;
}
