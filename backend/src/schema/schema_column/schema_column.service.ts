import { Injectable } from '@nestjs/common';
import { CreateSchemaColumnDto } from './dto/create-schema_column.dto';
import { UpdateSchemaColumnDto } from './dto/update-schema_column.dto';

@Injectable()
export class SchemaColumnService {
  create(createSchemaColumnDto: CreateSchemaColumnDto) {
    return 'This action adds a new schemaColumn';
  }

  findAll() {
    return `This action returns all schemaColumn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schemaColumn`;
  }

  update(id: number, updateSchemaColumnDto: UpdateSchemaColumnDto) {
    return `This action updates a #${id} schemaColumn`;
  }

  remove(id: number) {
    return `This action removes a #${id} schemaColumn`;
  }
}
