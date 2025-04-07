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
 * CreateSchemaDto example:{
      "table_name": "connection",
      "column_name": "databasetypeId",
      "data_type": "integer",
      "primary_key": null,
      "foreign_key": "foreign key",
      "unique_key": null,
      "key_type": "foreign key",
      "referenced_table": "databasetype",
      "referenced_column": "id"
    },
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
      // Change the CreateSchemaDto to a more suitable type for your needs
      /* Array of Objects:
        {
          "table": {
            "table_name": string,
            "column": {
              "column_name": string,
              "data_type": "integer",
              "primary_key"?: string,
              "foreign_key"?: string,
              "unique_key"?: string,
              "referenced_table": string,
              "referenced_column": string
            }
          }
        }
      */

      // Transform the input data into the desired format, remember to group the table by the name. 
      const transformedData = createSchemaDto.reduce((acc, item) => {
        const { table_name, column_name, data_type, primary_key, foreign_key, unique_key, referenced_table, referenced_column } = item;
        console.log('item', item);

        if (!acc[table_name]) {
          acc[table_name] = {
            table_name,
            columns: [],
          };
        }
        acc[table_name].columns.push({
          column_name,
          data_type,
          primary_key,
          foreign_key,
          unique_key,
          referenced_table,
          referenced_column,
        });
        return acc;
      }, {});
      

      return transformedData

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
