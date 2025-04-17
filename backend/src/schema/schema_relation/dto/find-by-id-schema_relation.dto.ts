import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FindByIdSchemaRelationDto {
  @ApiProperty()
  @IsNumber()
  id_parent: number;

  @ApiProperty()
  @IsNumber()
  id_child: number;
}
