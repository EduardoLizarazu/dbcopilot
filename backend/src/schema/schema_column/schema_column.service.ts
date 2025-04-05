import { Injectable } from '@nestjs/common';
import { CreateSchemaColumnDto } from './dto/create-schema_column.dto';
import { UpdateSchemaColumnDto } from './dto/update-schema_column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaColumn } from './entities/schema_column.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchemaColumnService {
  constructor(
    @InjectRepository(SchemaColumn)
    private schemaColumnRepository: Repository<SchemaColumn>,
  ) {}
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
