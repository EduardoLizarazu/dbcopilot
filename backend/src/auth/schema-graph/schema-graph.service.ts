import { Injectable } from '@nestjs/common';
import { CreateSchemaGraphDto } from './dto/create-schema-graph.dto';
import { UpdateSchemaGraphDto } from './dto/update-schema-graph.dto';

@Injectable()
export class SchemaGraphService {
  create(createSchemaGraphDto: CreateSchemaGraphDto) {
    return 'This action adds a new schemaGraph';
  }

  findAll() {
    return `This action returns all schemaGraph`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schemaGraph`;
  }

  update(id: number, updateSchemaGraphDto: UpdateSchemaGraphDto) {
    return `This action updates a #${id} schemaGraph`;
  }

  remove(id: number) {
    return `This action removes a #${id} schemaGraph`;
  }
}
