import { Injectable } from '@nestjs/common';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaTable } from './schema_table/entities/schema_table.entity';
import { Repository } from 'typeorm';
import { SchemaColumn } from './schema_column/entities/schema_column.entity';
import { SchemaRelation } from './schema_relation/entities/schema_relation.entity';

/**
 * 
 * export class CreateSchemaDto {
    table_name: string;
    column_name: string;
    data_type: string;
    key_type: string;
    reference_table: string;
    reference_column: string;
}
 */



@Injectable()
export class SchemaService {

  constructor(
    @InjectRepository(SchemaTable)
    private schemaTableRepository: Repository<SchemaTable>,
    @InjectRepository(SchemaColumn)
    private schemaColumnRepository: Repository<SchemaColumn>,
    @InjectRepository(SchemaRelation)
    private schemaRelationRepository: Repository<SchemaRelation>,
  ) {}

  create(createSchemaDto: CreateSchemaDto[]) {
    try {
      // Insert the createSchemaDto using the schemaTableRepository, 
      // schemaColumnRepository, and schemaRelationRepository.
      // Assuming createSchemaDto is an array of schema objects
      // You might need to adjust this based on your actual data structure.

      // Tables
      const schemaTables = createSchemaDto.map(schema => {
        const table = this.schemaTableRepository.create({
          technicalName: schema.table_name,
        });
        return table;
      });

      // Columns
      // const schemaColumns = createSchemaDto.map(schema => {
      //   const column = this.schemaColumnRepository.create({
      //     technicalName: schema.column_name,
      //     dataType: schema.data_type,
      //     keyType: schema.key_type, // not a number
      //   });
      //   return column;
      // });

    } catch (error) {
      console.error('Error creating schema ' + error);
      throw new Error('Error creating schema: ' + error.message);
    }
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
