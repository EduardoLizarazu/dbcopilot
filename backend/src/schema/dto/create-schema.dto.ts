import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

/* 
{
      "table_name": "connection",
      "column_name": "databasetypeId",
      "data_type": "integer",
      "primary_key": null,
      "foreign_key": "foreign key",
      "unique_key": null,
      "key_type": "foreign key",
      "referenced_table": "databasetype",
      "referenced_column": "id"
    },
*/

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
    primary_key?: string;

    @ApiProperty()
    @IsString()
    foreign_key?: string;

    @ApiProperty()
    @IsString()
    unique_key?: string;

    @ApiProperty()
    @IsString()
    referenced_table?: string;

    @ApiProperty()
    @IsString()
    referenced_column?: string;
}
