import { Injectable } from '@nestjs/common';
import { CreateSchemaRelationDto } from './dto/create-schema_relation.dto';
import { UpdateSchemaRelationDto } from './dto/update-schema_relation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaRelation } from './entities/schema_relation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SchemaRelationService {
  constructor(
    @InjectRepository(SchemaRelation)
    private schemaRelationRepository: Repository<SchemaRelation>,
  ) {}
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
