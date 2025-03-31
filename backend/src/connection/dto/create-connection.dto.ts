import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';


export class CreateConnectionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    dbType: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
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
}
