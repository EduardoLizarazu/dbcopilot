import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateSchemaTableDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    connectionId: number;

    @ApiProperty()
    @IsString()
    technicalName: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    alias?: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { each: true })
    schemaColumns?: number[]; 
}
