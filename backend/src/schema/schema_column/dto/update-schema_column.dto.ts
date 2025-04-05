import { PartialType } from '@nestjs/swagger';
import { CreateSchemaColumnDto } from './create-schema_column.dto';

export class UpdateSchemaColumnDto extends PartialType(CreateSchemaColumnDto) {}
