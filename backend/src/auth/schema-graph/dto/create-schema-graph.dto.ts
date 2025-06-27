import { IsNumber } from 'class-validator';

export class CreateSchemaGraphDto {
  @IsNumber()
  roleId: number;

  @IsNumber()
  columnId: number;

  @IsNumber()
  tableId: number;
}
