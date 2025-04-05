import { PartialType } from '@nestjs/swagger';
import { CreateColumnTableDto } from './create-column_table.dto';

export class UpdateColumnTableDto extends PartialType(CreateColumnTableDto) {}
