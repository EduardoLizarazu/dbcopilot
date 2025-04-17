import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteSchemaRelationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  columnIdFather: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  columnIdChild: number;
}
