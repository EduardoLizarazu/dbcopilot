import { Injectable } from '@nestjs/common';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaTable } from './schema_table/entities/schema_table.entity';
import { Repository } from 'typeorm';
import { SchemaColumn } from './schema_column/entities/schema_column.entity';

@Injectable()
export class SchemaService {

  constructor(
    @InjectRepository(SchemaTable)
    private schemaTableRepository: Repository<SchemaTable>,
    @InjectRepository(SchemaColumn)
    private schemaColumnRepository: Repository<SchemaColumn>,
  ) {}

  create(createSchemaDto: CreateSchemaDto) {
    return 'This action adds a new schema';
  }

  findAll() {
    return `This action returns all schema`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schema`;
  }

  update(id: number, updateSchemaDto: UpdateSchemaDto) {
    return `This action updates a #${id} schema`;
  }

  remove(id: number) {
    return `This action removes a #${id} schema`;
  }
}
