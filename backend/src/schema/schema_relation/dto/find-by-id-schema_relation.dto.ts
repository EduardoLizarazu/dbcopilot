import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FindByIdSchemaRelationDto {
  @ApiProperty()
  @IsNumber()
  columnIdFather: number;

  @ApiProperty()
  @IsNumber()
  columnIdChild: number;
}
