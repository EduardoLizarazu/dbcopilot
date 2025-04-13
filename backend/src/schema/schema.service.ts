import { Injectable } from '@nestjs/common';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SchemaTable } from './schema_table/entities/schema_table.entity';
import { SchemaColumn } from './schema_column/entities/schema_column.entity';
import { SchemaRelation } from './schema_relation/entities/schema_relation.entity';
import {
  entityKeyType,
  SchemaColumnKey,
} from './schema_column/entities/schema_column_key.entity';
import { SchemaColumnKeyColumn } from './schema_column/entities/schema_column_key_column.entity';
import { createSchemaDtoToArray } from './utils/create-schema-dto-to-array';

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
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}

  async create(connectionId: number, createSchemaDto: CreateSchemaDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transformedDataArray = createSchemaDtoToArray(createSchemaDto);

      console.log('before saving...');
      for (const [tableIndex, table] of transformedDataArray.entries()) {
        const schemaTable = queryRunner.manager.create(SchemaTable, {
          technicalName: table.table_name,
          connection: { id: connectionId },
        });
        const savedTable = await queryRunner.manager.save(schemaTable); // save tables
        transformedDataArray[tableIndex].table_id = savedTable.id; // Store the saved table ID back in the transformed data
        console.log('I am saving the table', savedTable);

        for (const [columnIndex, column] of table.columns.entries()) {
          const schemaColumn = queryRunner.manager.create(SchemaColumn, {
            technicalName: column.column_name,
            dataType: column.data_type,
            schemaTable: { id: savedTable.id }, // Set the relation to the saved schemaTable
          });
          const savedColumn = await queryRunner.manager.save(schemaColumn); // save columns
          transformedDataArray[tableIndex].columns[columnIndex].column_id =
            savedColumn.id; // Store the saved column ID back in the transformed data
          console.log('I am saving the column', savedColumn);

          // Save the key type
          if (column.primary_key) {
            // Get the primary key type of the entity SchemaColumnKey
            const schemaColumnKey = await queryRunner.manager.findOne(
              SchemaColumnKey,
              {
                where: { type: entityKeyType.PRIMARY_KEY },
              },
            );
            if (!schemaColumnKey) throw new Error('Primary key type not found');
            const schemaColumnKeyColumn = queryRunner.manager.create(
              SchemaColumnKeyColumn,
              {
                id_column_key: schemaColumnKey.id,
                id_schema_column: savedColumn.id,
                is_static: true,
              },
            );
            await queryRunner.manager.save(schemaColumnKeyColumn); // save primary key
          }

          if (column.foreign_key) {
            // Get the foreign key type of the entity SchemaColumnKey
            const schemaColumnKey = await queryRunner.manager.findOne(
              SchemaColumnKey,
              {
                where: { type: entityKeyType.FOREIGN_KEY },
              },
            );
            if (!schemaColumnKey) throw new Error('Foreign key type not found');
            const schemaColumnKeyColumn = queryRunner.manager.create(
              SchemaColumnKeyColumn,
              {
                id_column_key: schemaColumnKey.id,
                id_schema_column: savedColumn.id,
                is_static: true,
              },
            );
            await queryRunner.manager.save(schemaColumnKeyColumn); // save foreign key
          }

          if (column.unique_key) {
            // Get the unique key type of the entity SchemaColumnKey
            const schemaColumnKey = await queryRunner.manager.findOne(
              SchemaColumnKey,
              {
                where: { type: entityKeyType.UNIQUE_KEY },
              },
            );
            if (!schemaColumnKey) throw new Error('Unique key type not found');
            const schemaColumnKeyColumn = queryRunner.manager.create(
              SchemaColumnKeyColumn,
              {
                id_column_key: schemaColumnKey.id,
                id_schema_column: savedColumn.id,
                is_static: true,
              },
            );
            await queryRunner.manager.save(schemaColumnKeyColumn); // save unique key
          }
        }
      }

      console.log('transformedDataArray', transformedDataArray);

      // Save relations
      for (const table of transformedDataArray) {
        for (const column of table.columns) {
          if (column.referenced_table && column.referenced_column) {
            // PRIMARY KEY OR COLUMN FATHER
            // Find table's id for the primary key or column father
            const referencedTable = transformedDataArray.find(
              (t) => t.table_name === column.referenced_table,
            );

            // Find column's id of the referenced table based on the referenced column name
            const referencedColumn = referencedTable?.columns.find(
              (c) => c.column_name === column.referenced_column,
            );

            // If the referenced table and column exist, create the relation
            if (referencedTable && referencedColumn) {
              // FOREIGN KEY
              // Find the table'id for the foreign key
              const foreignKeyTable = transformedDataArray.find(
                (t) => t.table_name === table.table_name,
              );
              // Find the column'id of the foreign key table based on the column name
              const foreignKeyColumn = foreignKeyTable?.columns.find(
                (c) => c.column_name === column.column_name,
              );

              if (foreignKeyColumn) {
                const schemaRelation = queryRunner.manager.create(
                  SchemaRelation,
                  {
                    columnIdChild: foreignKeyColumn.column_id, // Set the relation to the foreign key column
                    columnIdFather: referencedColumn.column_id, // Set the relation to the referenced column
                  },
                );
                await queryRunner.manager.save(schemaRelation);
                console.log('I am saving the relation', schemaRelation);
              }
            }
          }
        }
      }

      console.log('after saving...');

      await queryRunner.commitTransaction();

      return await this.findSchemaByConnectionId(connectionId);
    } catch (error) {
      console.error('Error creating schema: ', error);
      await queryRunner.rollbackTransaction();
      throw new Error('Error creating schema: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all schema`;
  }

  async findSchemaByConnectionId(connectionId: number) {
    try {
      const schemaData = await this.dataSource
        .createQueryBuilder()
        .select([
          'schema_table.id',
          'schema_table.technicalName',
          'schema_table.alias',
          'schema_table.description',
          'schema_column.id',
          'schema_column.technicalName',
          'schema_column.alias',
          'schema_column.dataType',
          'schema_relation.columnIdChild',
          'schema_relation.columnIdFather',
          'schema_relation.description',
        ])
        .from('schema_table', 'schema_table')
        .leftJoin(
          'schema_column',
          'schema_column',
          'schema_table.id = schema_column.schemaTableId',
        )
        .leftJoin(
          'schema_relation',
          'schema_relation',
          'schema_column.id = schema_relation.columnIdChild',
        )
        .where('schema_table.connectionId = :connectionId', {
          connectionId: connectionId,
        })
        .getRawMany();

      console.log(schemaData);

      // Transform the raw data into a more structured format
      const transformedData = schemaData.reduce((acc, row) => {
        const tableId = row.schema_table_id;
        const columnId = row.schema_column_id;

        if (!acc[tableId]) {
          acc[tableId] = {
            table_id: tableId,
            table_name: row.schema_table_technicalName,
            table_alias: row.schema_table_alias,
            table_description: row.schema_table_description,
            columns: [],
          };
        }

        if (columnId) {
          acc[tableId].columns.push({
            column_id: columnId,
            column_name: row.schema_column_technicalName,
            column_alias: row.schema_column_alias,
            column_description: row.schema_column_description,
            column_data_type: row.schema_column_dataType,
            foreign_key: row.schema_relation_columnIdChild,
            primary_key: row.schema_relation_columnIdFather,
            relation_description: row.schema_relation_description,
          });
        }

        return acc;
      }, {});

      // Convert the object back to an array
      const schemaDataArray = Object.values(transformedData).map(
        (item: {
          table_id: number;
          table_name: string;
          table_alias: string;
          table_description: string;
          columns: {
            column_id: number;
            column_name: string;
            column_alias: string;
            column_description: string;
            column_data_type: string;
            foreign_key: number;
            primary_key: number;
            relation_description: string;
          }[];
        }) => {
          return {
            table_id: item.table_id,
            table_name: item.table_name,
            table_alias: item.table_alias,
            table_description: item.table_description,
            columns: item.columns.map((col) => ({
              column_id: col.column_id,
              column_name: col.column_name,
              column_alias: col.column_alias,
              column_description: col.column_description,
              column_data_type: col.column_data_type,
              foreign_key: col.foreign_key,
              primary_key: col.primary_key,
              relation_description: col.relation_description,
            })),
          };
        },
      );

      return schemaDataArray;
    } catch (error) {
      console.error('Error finding schema by connection ID: ', error);
      throw new Error(
        'Error finding schema by connection ID: ' + error.message,
      );
    }
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
