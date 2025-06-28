import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSchemaGraphDto {
  @IsNumber()
  @IsNotEmpty()
  role_id: number;

  @IsNotEmpty()
  @IsNumber()
  column_id: number;

  @IsNotEmpty()
  @IsNumber()
  table_id: number;
}
