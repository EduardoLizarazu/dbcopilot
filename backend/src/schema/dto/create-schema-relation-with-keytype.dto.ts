import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSchemaRelationWithKeyTypeDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  columnIdFather: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  columnIdChild: number;

  @ApiProperty()
  @IsString()
  description: string | null;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isStatic: boolean;
}
