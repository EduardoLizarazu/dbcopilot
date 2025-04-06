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
      const schemaTable = this.schemaTableRepository.create({
        table_name: createSchemaDto[0].table_name,
      });
      const schemaColumn = this.schemaColumnRepository.create({
        column_name: createSchemaDto[0].column_name,
        data_type: createSchemaDto[0].data_type,
        key_type: createSchemaDto[0].key_type,
        reference_table: createSchemaDto[0].reference_table,
        reference_column: createSchemaDto[0].reference_column,
      });
      const schemaRelation = this.schemaRelationRepository.create({
        table_name: createSchemaDto[0].table_name,
        column_name: createSchemaDto[0].column_name,
        data_type: createSchemaDto[0].data_type,
        key_type: createSchemaDto[0].key_type,
        reference_table: createSchemaDto[0].reference_table,
        reference_column: createSchemaDto[0].reference_column,
      });
      // Save the entities to the database
      return Promise.all([
        this.schemaTableRepository.save(schemaTable),
        this.schemaColumnRepository.save(schemaColumn),
        this.schemaRelationRepository.save(schemaRelation),
      ]).then(([savedTable, savedColumn, savedRelation]) => {
        return {
          table: savedTable,
          column: savedColumn,
          relation: savedRelation,
        };
      });

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
