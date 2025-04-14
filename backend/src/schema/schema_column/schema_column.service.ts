import { Injectable } from '@nestjs/common';
import { CreateSchemaColumnDto } from './dto/create-schema_column.dto';
import { UpdateSchemaColumnDto } from './dto/update-schema_column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SchemaColumn } from './entities/schema_column.entity';
import { DataSource, Repository } from 'typeorm';
import {
  formatSchemaColumns,
  SchemaColumnQueryFormat,
  SchemaColumnsQuery,
} from './interface/schema_column.interface';

@Injectable()
export class SchemaColumnService {
  constructor(
    @InjectRepository(SchemaColumn)
    private schemaColumnRepository: Repository<SchemaColumn>,
    private dataSource: DataSource,
  ) {}
  async create(createSchemaColumnDto: CreateSchemaColumnDto) {
    try {
      // const newSchemaColumn = this.schemaColumnRepository.create({
      //   ...createSchemaColumnDto,
      //   schemaColumnKey: createSchemaColumnDto.schemaColumnKeys?.map((id) => ({
      //     id,
      //   })),
      // });
      // await this.schemaColumnRepository.save(newSchemaColumn);
      // return newSchemaColumn;
    } catch (error) {
      throw new Error(`Error creating schema column: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.schemaColumnRepository.find({
        relations: ['schemaRelation'],
      });
    } catch (error) {
      throw new Error(`Error fetching schema columns: ${error.message}`);
    }
  }

  async findOne(id: number) {
    try {
      const schemaColumn = await this.schemaColumnRepository.findOne({
        where: { id },
      });
      return schemaColumn;
    } catch (error) {
      throw new Error(`Error fetching schema column: ${error.message}`);
    }
  }

  async findByTableId(tableId: number): Promise<SchemaColumnQueryFormat[]> {
    try {
      /**
       * -- Select all schema_columns (id) belonging to a schema_table (id) with the relations the columns that have more than on key would be repeated.
        select schema_column.id as column_id, schema_column."technicalName" as column_technical_name, schema_column.alias as column_alias, schema_column."dataType" as column_data_type, schema_column.description as column_description,
        schema_relation."columnIdChild" as relation_foreign_key_id, schema_relation."columnIdFather" as relation_primary_key_id, schema_relation."isStatic" as relation_is_static,
        schema_column_key_column."is_static" as column_key_is_static,
        schema_column_key."type" as column_key_type
        from schema_column
        left join schema_relation on schema_column.id = schema_relation."columnIdChild"
        left join schema_column_key_column on schema_column.id = schema_column_key_column.id_schema_column
        left join schema_column_key on schema_column_key_column.id_column_key = schema_column_key.id
        where schema_column."schemaTableId" = 283 and schema_column.id=551;
      */
      // with datasource

      /**
       * {
          "column_id": 551,
          "column_technical_name": "columnIdChild",
          "column_alias": null,
          "column_data_type": "integer",
          "column_description": null,
          "relation_foreign_key_id": 551,
          "relation_primary_key_id": 543,
          "relation_is_static": true,
          "column_key_is_static": true,
          "column_key_type": "pk"
        }
      */

      const schemaColumns: SchemaColumnsQuery[] = await this.dataSource.query(
        ` select schema_column.id as column_id, schema_column."technicalName" as column_technical_name, schema_column.alias as column_alias, schema_column."dataType" as column_data_type, schema_column.description as column_description,
        schema_relation."columnIdChild" as relation_foreign_key_id, schema_relation."columnIdFather" as relation_primary_key_id, schema_relation."isStatic" as relation_is_static,
        schema_column_key_column."is_static" as column_key_is_static,
        schema_column_key."type" as column_key_type
        from schema_column
        left join schema_relation on schema_column.id = schema_relation."columnIdChild"
        left join schema_column_key_column on schema_column.id = schema_column_key_column.id_schema_column
        left join schema_column_key on schema_column_key_column.id_column_key = schema_column_key.id
        where schema_column."schemaTableId" = $1`,
        [tableId],
      );
      if (!schemaColumns) {
        throw new Error(`Schema columns for table ID ${tableId} not found`);
      }

      // Format the schema columns to match the expected format

      const schemaColumnFormatted: SchemaColumnQueryFormat[] =
        formatSchemaColumns(schemaColumns);

      return schemaColumnFormatted;
    } catch (error) {
      throw new Error(
        `Error fetching schema columns by table ID: ${error.message}`,
      );
    }
  }

  async update(id: number, updateSchemaColumnDto: UpdateSchemaColumnDto) {
    try {
      const schemaColumn = await this.schemaColumnRepository.findOne({
        where: { id },
      });
      if (!schemaColumn) {
        throw new Error(`Schema column with ID ${id} not found`);
      }
      Object.assign(schemaColumn, updateSchemaColumnDto);
      await this.schemaColumnRepository.save(schemaColumn);
      return schemaColumn;
    } catch (error) {
      throw new Error(`Error updating schema column: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      const schemaColumn = await this.schemaColumnRepository.findOne({
        where: { id },
      });
      if (!schemaColumn) {
        throw new Error(`Schema column with ID ${id} not found`);
      }
      await this.schemaColumnRepository.remove(schemaColumn);
      return schemaColumn;
    } catch (error) {
      throw new Error(`Error removing schema column: ${error.message}`);
    }
  }
}
