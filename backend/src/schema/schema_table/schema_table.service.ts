import { Injectable } from '@nestjs/common';
import { CreateSchemaTableDto } from './dto/create-schema_table.dto';
import { UpdateSchemaTableDto } from './dto/update-schema_table.dto';

@Injectable()
export class SchemaTableService {
  create(createSchemaTableDto: CreateSchemaTableDto) {
    return 'This action adds a new schemaTable';
  }

  findAll() {
    return `This action returns all schemaTable`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schemaTable`;
  }

  update(id: number, updateSchemaTableDto: UpdateSchemaTableDto) {
    return `This action updates a #${id} schemaTable`;
  }

  remove(id: number) {
    return `This action removes a #${id} schemaTable`;
  }
}
