import { Injectable } from '@nestjs/common';
import { CreateSchemaRelationDto } from './dto/create-schema_relation.dto';
import { UpdateSchemaRelationDto } from './dto/update-schema_relation.dto';

@Injectable()
export class SchemaRelationService {
  create(createSchemaRelationDto: CreateSchemaRelationDto) {
    return 'This action adds a new schemaRelation';
  }

  findAll() {
    return `This action returns all schemaRelation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schemaRelation`;
  }

  update(id: number, updateSchemaRelationDto: UpdateSchemaRelationDto) {
    return `This action updates a #${id} schemaRelation`;
  }

  remove(id: number) {
    return `This action removes a #${id} schemaRelation`;
  }
}
