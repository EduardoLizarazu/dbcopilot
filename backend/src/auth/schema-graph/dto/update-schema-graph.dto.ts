import { PartialType } from '@nestjs/swagger';
import { CreateSchemaGraphDto } from './create-schema-graph.dto';

export class UpdateSchemaGraphDto extends PartialType(CreateSchemaGraphDto) {}
