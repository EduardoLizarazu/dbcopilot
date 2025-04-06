import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSchemaDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    table_name: string;

    @ApiProperty()
    @IsString()
    column_name?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    data_type: string;

    @ApiProperty()
    @IsString()
    key_type?: string;

    @ApiProperty()
    @IsString()
    reference_table?: string;

    @ApiProperty()
    @IsString()
    reference_column?: string;
}
