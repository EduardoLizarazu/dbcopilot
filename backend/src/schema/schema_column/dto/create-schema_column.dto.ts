import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSchemaColumnDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    technicalName: string;

    @ApiProperty()
    @IsString()
    alias?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    dataType: string;

    @ApiProperty()
    @IsNotEmpty()
    schemaColumnKeys: number[]; // Array of IDs for SchemaColumnKey entities

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    schemaTableId: number; // ID of the SchemaTable entity

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    schemaRelationFatherId?: number; // Optional ID of the SchemaRelation entity for father relation
    
    @ApiProperty()
    @IsOptional()
    @IsNumber()
    schemaRelationChildId?: number; // Optional ID of the SchemaRelation entity for child relation
}
