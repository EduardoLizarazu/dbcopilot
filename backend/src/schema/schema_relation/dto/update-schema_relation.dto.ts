import { PartialType } from '@nestjs/swagger';
import { CreateSchemaRelationDto } from './create-schema_relation.dto';

export class UpdateSchemaRelationDto extends PartialType(CreateSchemaRelationDto) {}
