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

  async create(connectionId: number, createSchemaDto: CreateSchemaDto[]) {
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
              "referenced_table": string, // technical name of the table
              "referenced_column": string // technical name of the column
            }
          }
        }
      */

      // Transform the input data into the desired format, remember to group the table by the name. 
      const transformedData = createSchemaDto.reduce((acc, item) => {
        const { table_name, column_name, data_type, primary_key, foreign_key, unique_key, referenced_table, referenced_column } = item;
        

        // Remove '' or "" from tabla_name and column_name
        const synthesized_table_name = table_name.replace(/['"]+/g, '');
        const synthesized_column_name = column_name ? column_name.replace(/['"]+/g, '') : null;

        if (!acc[synthesized_table_name]) {
          acc[synthesized_table_name] = {
            table_name: synthesized_table_name,
            columns: [],
          };
        }
        acc[synthesized_table_name].columns.push({
          column_name: synthesized_column_name,
          data_type,
          primary_key,
          foreign_key,
          unique_key,
          referenced_table,
          referenced_column,
        });
        return acc;
      }, {});
      

      // Convert the object back to an array
      const transformedDataArray = Object.values(transformedData).map((item: { table_name: string; columns: any[] }) => {
        return {
          table_name: item.table_name,
          columns: item.columns.map((col) => ({
            column_name: col.column_name,
            data_type: col.data_type,
            primary_key: col.primary_key,
            foreign_key: col.foreign_key,
            unique_key: col.unique_key,
            referenced_table: col.referenced_table,
            referenced_column: col.referenced_column,
          })),
        };
      }
      );

      
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
