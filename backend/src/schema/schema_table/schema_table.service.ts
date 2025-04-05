import { Injectable } from '@nestjs/common';
import { CreateSchemaTableDto } from './dto/create-schema_table.dto';
import { UpdateSchemaTableDto } from './dto/update-schema_table.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaTable } from './entities/schema_table.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchemaTableService {
  constructor(
    @InjectRepository(SchemaTable)
    private schemaTableRepository: Repository<SchemaTable>,
  ) {}
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
