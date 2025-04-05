import { PartialType } from '@nestjs/swagger';
import { CreateSchemaTableDto } from './create-schema_table.dto';

export class UpdateSchemaTableDto extends PartialType(CreateSchemaTableDto) {}
