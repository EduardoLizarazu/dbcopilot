import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ColumnDto {
  @ApiProperty()
  @IsInt()
  column_id: number;

  @ApiProperty()
  @IsString()
  column_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  column_alias: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  column_description: string | null;

  @ApiProperty()
  @IsString()
  column_data_type: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  column_key_type: string | null;

  @ApiProperty()
  @IsOptional()
  column_key_is_static: boolean | null;

  @ApiProperty()
  @IsOptional()
  foreign_key: number | null; // You might want to create a specific DTO for foreign keys

  @ApiProperty()
  @IsOptional()
  primary_key: number | null; // You might want to create a specific DTO for primary keys

  @ApiProperty()
  @IsOptional()
  @IsString()
  relation_description: string | null;

  @ApiProperty()
  @IsOptional()
  relation_is_static: boolean | null;
}

export class TableMetadataDto {
  @ApiProperty()
  @IsInt()
  table_id: number;

  @ApiProperty()
  @IsString()
  table_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  table_alias: string | null;

  @ApiProperty()
  @IsOptional()
  @IsString()
  table_description: string | null;

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnDto)
  columns: ColumnDto[];
}
