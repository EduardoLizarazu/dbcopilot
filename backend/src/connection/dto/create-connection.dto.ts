import { IsString, IsNotEmpty, IsNumber } from 'class-validator';


export class CreateConnectionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description?: string;

    @IsString()
    @IsNotEmpty()
    dbType: string;

    @IsString()
    @IsNotEmpty()
    dbName: string;

    @IsString()
    @IsNotEmpty()
    dbHost: string;

    @IsNumber()
    dbPort: number;

    @IsString()
    @IsNotEmpty()
    dbUsername: string;

    @IsString()
    dbPassword?: string;
}
