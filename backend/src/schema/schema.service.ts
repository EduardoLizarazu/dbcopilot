import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { SchemaTable } from './schema_table/entities/schema_table.entity';
import { SchemaColumn } from './schema_column/entities/schema_column.entity';
import { SchemaRelation } from './schema_relation/entities/schema_relation.entity';
import {
  entityKeyType,
  SchemaColumnKey,
} from './schema_column/entities/schema_column_key.entity';
import { SchemaColumnKeyColumn } from './schema_column/entities/schema_column_key_column.entity';
import { createSchemaDtoToArray } from './utils/create-schema-dto-to-array';
import {
  TSchemaRelationWithKeyType,
  verifiedSchemaRelationWithKeyType,
} from './interface/schema_relation_with_key_type';
import { CreateSchemaRelationWithKeyTypeDto } from './dto/create-schema-relation-with-keytype.dto';
import { DeleteSchemaRelationDto } from './schema_relation/dto/detele-schema_relation.dto';
import { CreateSchemaIncludingConnectionDto } from './dto/create-schema-including-connection.dto';
import { Connection } from 'src/connection/entities/connection.entity';
import { Databasetype } from 'src/databasetype/entities/databasetype.entity';
import { TableMetadataDto } from './dto/create-schema-formatted.dto';

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

  async create(connectionId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify the table does not have connection id related to it
      const existingSchema = await queryRunner.manager.findOne(SchemaTable, {
        where: { connection: { id: connectionId } },
      });
      if (existingSchema) {
        console.error(
          'Schema already exists for this connection ID:',
          connectionId,
        );
        return HttpStatus.CONFLICT;
      }

      // Get Connection from the connectionId relation with database type with password
      const connection = await queryRunner.manager.findOne(Connection, {
        where: { id: connectionId },
        relations: ['databasetype'],
        select: {
          id: true,
          dbHost: true,
          dbPort: true,
          dbUsername: true,
          dbPassword: true,
          dbName: true,
          databasetype: {
            id: true,
            type: true,
            query: true,
          },
        },
      });
      if (!connection) {
        console.error('Connection not found');
        return HttpStatus.NOT_FOUND;
      }
      console.log('connection', connection);

      // Get the schema data from the saved connection
      const dataSource = new DataSource({
        type: connection.databasetype.type as any, // Cast to TypeORM's DatabaseType
        host: connection.dbHost,
        port: connection.dbPort,
        username: connection.dbUsername,
        password: connection.dbPassword,
        database: connection.dbName,
        synchronize: false,
        logging: false,
      });
      const db = await dataSource.initialize(); // Initialize and check connection
      const schema = await db.query(`${connection.databasetype.query}`); // Get the schema data
      await dataSource.destroy(); // Close connection after test

      const transformedDataArray = createSchemaDtoToArray(schema);

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
                    isStatic: true,
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

      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Error creating schema: ', error);
      await queryRunner.rollbackTransaction();
      return HttpStatus.BAD_REQUEST;
    } finally {
      await queryRunner.release();
    }
  }

  async createSchemaIncludingConnection(
    input: CreateSchemaIncludingConnectionDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!input.is_connected) return HttpStatus.BAD_REQUEST;
      // Create the connection first
      const connectionEntity = queryRunner.manager.create(Connection, {
        name: input.name,
        description: input.description,
        // dbTypeId: input.dbTypeId,
        dbName: input.dbName,
        dbHost: input.dbHost,
        dbPort: input.dbPort,
        dbUsername: input.dbUsername,
        dbPassword: input.dbPassword,
        is_connected: input.is_connected, // Set to true
        databasetype: { id: input.dbTypeId }, // Set the relation to the database type
      });
      const savedConnection = await queryRunner.manager.save(
        Connection,
        connectionEntity,
      );

      console.log('I am saving the connection', savedConnection);

      //  Get the query base on the database type id
      const dbType = await this.dataSource.manager.findOne(Databasetype, {
        where: { id: input.dbTypeId },
      });
      if (!dbType) {
        console.error('Database type not found');
        return HttpStatus.NOT_FOUND;
      }

      // Get the schema data from the saved connection
      const dataSource = new DataSource({
        type: dbType.type as any, // Cast to TypeORM's DatabaseType
        host: savedConnection.dbHost,
        port: savedConnection.dbPort,
        username: savedConnection.dbUsername,
        password: savedConnection.dbPassword,
        database: savedConnection.dbName,
        synchronize: false,
        logging: false,
      });

      const db = await dataSource.initialize(); // Initialize and check connection
      const schema = await db.query(`${dbType.query}`); // Get the schema data
      await dataSource.destroy(); // Close connection after test

      // console.log('to save the schema: ', schema);

      // const res = await this.create(savedConnection.id, schema); // Create the schema using the connection ID and schema data

      // if (res !== HttpStatus.CREATED) {
      //   console.error('Error creating schema: ', res);
      //   queryRunner.rollbackTransaction();
      //   return HttpStatus.BAD_REQUEST;
      // }

      // -----------------------------------------------------------------------------------------------------------------------------
      console.log('schema: ', schema);

      console.log('before saving schema...');
      const transformedDataArray = createSchemaDtoToArray(schema);

      for (const [tableIndex, table] of transformedDataArray.entries()) {
        const schemaTable = queryRunner.manager.create(SchemaTable, {
          technicalName: table.table_name,
          connection: { id: savedConnection.id },
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
                    isStatic: true,
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
      // -----------------------------------------------------------------------------------------------------------------------------

      await queryRunner.commitTransaction();
      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Error creating schema including connection: ', error);
      await queryRunner.rollbackTransaction();
      return HttpStatus.BAD_REQUEST;
    } finally {
      await queryRunner.release(); // Release the query runner
    }
  }

  async updateSchemaFromFormattedSchema(
    connectionId: number,
    schemaFormatted: TableMetadataDto[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify if the connection ID exists
      const connection = await queryRunner.manager.findOne(Connection, {
        where: { id: connectionId },
      });
      if (!connection) {
        console.error('Connection not found');
        return HttpStatus.NOT_FOUND;
      }
      console.log('connection', connection);

      console.log('before updating...');

      for (const [tableIndex, table] of schemaFormatted.entries()) {
        // update table
        const schemaTable = queryRunner.manager.update(
          SchemaTable,
          { id: table.table_id }, // Update the table with the given ID
          {
            technicalName: table.table_name,
            alias: table.table_alias || undefined,
            description: table.table_description || undefined,
          },
        );

        console.log('I am updating the table...', schemaTable);

        for (const [columnIndex, column] of table.columns.entries()) {
          // update column
          const schemaColumn = queryRunner.manager.update(
            SchemaColumn,
            { id: column.column_id }, // Update the column with the given ID
            {
              technicalName: column.column_name,
              alias: column.column_alias || undefined,
              description: column.column_description || undefined,
              dataType: column.column_data_type,
            },
          );

          console.log('I am updating the column...', schemaColumn);

          // update relation
          const schemaRelation = queryRunner.manager.update(
            SchemaRelation,
            {
              columnIdChild: column.foreign_key,
              columnIdFather: column.primary_key || undefined,
            }, // Update the relation with the given ID
            {
              columnIdChild: column.column_id,
              columnIdFather: column.primary_key || undefined,
              description: column.relation_description || undefined,
              isStatic: column.relation_is_static || false,
            },
          );
          console.log('I am updating the relation...', schemaRelation);
        }
      }

      console.log('after updating...');

      await queryRunner.commitTransaction();

      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Error creating schema: ', error);
      await queryRunner.rollbackTransaction();
      return HttpStatus.BAD_REQUEST;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all schema`;
  }

  async findSchemaByConnectionId(connectionId: number) {
    try {
      // Fetch the key type too
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
          'schema_relation.isStatic',
          'schema_column_key_column.is_static',
          'schema_column_key.type',
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
        .leftJoin(
          'schema_column_key_column',
          'schema_column_key_column',
          'schema_column.id = schema_column_key_column.id_schema_column',
        )
        .leftJoin(
          'schema_column_key',
          'schema_column_key',
          'schema_column_key_column.id_column_key = schema_column_key.id',
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
            column_key_type: row.schema_column_key_type,
            column_key_is_static: row.schema_column_key_column_is_static,
            foreign_key: row.schema_relation_columnIdChild,
            primary_key: row.schema_relation_columnIdFather,
            relation_description: row.schema_relation_description,
            relation_is_static: row.schema_relation_isStatic,
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
            column_key_type: string;
            column_key_is_static: boolean;
            foreign_key: number;
            primary_key: number;
            relation_description: string;
            relation_is_static: boolean;
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
              column_key_type: col.column_key_type,
              column_key_is_static: col.column_key_is_static,
              foreign_key: col.foreign_key,
              primary_key: col.primary_key,
              relation_description: col.relation_description,
              relation_is_static: col.relation_is_static,
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

  async createRelationWithKeyType(data: CreateSchemaRelationWithKeyTypeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const dataValidated = verifiedSchemaRelationWithKeyType(data);
      if (!dataValidated) return HttpStatus.BAD_REQUEST;
      console.log('dataValidated', dataValidated);

      // RELATION
      // Check if the relation already exists
      const existingRelation = await queryRunner.manager.findOne(
        SchemaRelation,
        {
          where: {
            columnIdChild: dataValidated.columnIdChild,
            columnIdFather: dataValidated.columnIdFather,
          },
        },
      );
      if (existingRelation) {
        console.error('Relation already exists:', existingRelation);
        return HttpStatus.CONFLICT;
      }

      const schemaRelation = queryRunner.manager.create(SchemaRelation, {
        columnIdChild: dataValidated.columnIdChild ?? undefined,
        columnIdFather: dataValidated.columnIdFather ?? undefined,
        description: dataValidated.description ?? undefined,
        isStatic: false,
      });

      // KEY TYPE
      // Check if the key type already exists
      const existingKeyType = await queryRunner.manager.findOne(
        SchemaColumnKeyColumn,
        {
          where: {
            id_column_key: dataValidated.columnIdChild,
            id_schema_column: dataValidated.columnIdFather,
          },
        },
      );
      if (existingKeyType) {
        console.error('Key type already exists:', existingKeyType);
        return HttpStatus.CONFLICT;
      }

      // Get the key type of the entity SchemaColumnKey primary key or foreign key
      const schemaColumnKey = await queryRunner.manager.find(SchemaColumnKey, {
        where: [
          { type: entityKeyType.PRIMARY_KEY },
          { type: entityKeyType.FOREIGN_KEY },
        ],
      });
      if (!schemaColumnKey) {
        console.error('Key type not found');
        return HttpStatus.NOT_FOUND;
      }
      console.log('schemaColumnKey', schemaColumnKey);
      const schemaColumnKeyPk = schemaColumnKey.find(
        (key) => key.type === entityKeyType.PRIMARY_KEY,
      );
      const schemaColumnKeyFk = schemaColumnKey.find(
        (key) => key.type === entityKeyType.FOREIGN_KEY,
      );

      // Check if the pk already exists and check the static field
      const existingKeyTypePk = await queryRunner.manager.findOne(
        SchemaColumnKeyColumn,
        {
          where: {
            id_column_key: schemaColumnKeyPk?.id,
            id_schema_column: dataValidated.columnIdFather,
          },
        },
      );

      const schemaColumnKeyColumnPk = queryRunner.manager.create(
        SchemaColumnKeyColumn,
        {
          id_column_key:
            schemaColumnKeyPk?.id ??
            (() => {
              console.error('Primary key type not found');
              return HttpStatus.NOT_FOUND;
            })(),
          id_schema_column: dataValidated.columnIdFather,
          is_static: existingKeyTypePk?.is_static || false,
        },
      );

      const schemaColumnKeyColumnFk = queryRunner.manager.create(
        SchemaColumnKeyColumn,
        {
          id_column_key:
            schemaColumnKeyFk?.id ??
            (() => {
              console.error('Foreign key type not found');
              return HttpStatus.NOT_FOUND;
            })(),
          id_schema_column: dataValidated.columnIdChild,
          is_static: false,
        },
      );

      await queryRunner.manager.save(schemaColumnKeyColumnPk); // save foreign key
      console.log(
        'I am saving the relation with key type',
        schemaColumnKeyColumnPk,
      );

      await queryRunner.manager.save(schemaColumnKeyColumnFk); // save primary key
      console.log(
        'I am saving the relation with key type',
        schemaColumnKeyColumnFk,
      );

      await queryRunner.manager.save(schemaRelation);
      console.log('I am saving the relation with key type', schemaRelation);

      await queryRunner.commitTransaction();
      return HttpStatus.CREATED;
    } catch (error) {
      console.error('Error creating relation with key type: ', error);
      return HttpStatus.BAD_REQUEST;
    }
  }

  async removeRelationWithKeyType(data: DeleteSchemaRelationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // RELATION
      // Check if the relation already exists
      const existingRelation = await queryRunner.manager.findOne(
        SchemaRelation,
        {
          where: {
            columnIdChild: data.columnIdChild,
            columnIdFather: data.columnIdFather,
          },
        },
      );
      if (!existingRelation) {
        console.error('Relation does not exist:', existingRelation);
        return HttpStatus.NOT_FOUND;
      }
      if (existingRelation.isStatic) {
        console.error('Relation is static:', existingRelation);
        return HttpStatus.FORBIDDEN;
      }
      await queryRunner.manager.remove(SchemaRelation, existingRelation); // remove relation

      // KEY TYPE FK
      // GET COLUMN KEY ID FK
      const columnKeyIdFk = await queryRunner.manager.findOne(SchemaColumnKey, {
        where: { type: entityKeyType.FOREIGN_KEY },
      });
      if (!columnKeyIdFk) {
        console.error('Key type not found');
        return HttpStatus.NOT_FOUND;
      }
      console.log('columnKeyIdFk', columnKeyIdFk);

      // Check if the key type already exists
      const existingKeyTypeFk = await queryRunner.manager.findOne(
        SchemaColumnKeyColumn,
        {
          where: {
            id_column_key: columnKeyIdFk.id,
            id_schema_column: data.columnIdChild,
          },
        },
      );
      if (!existingKeyTypeFk) {
        console.error(
          'Key type with column (FK) does not exist:',
          existingKeyTypeFk,
        );
        return HttpStatus.NOT_FOUND;
      }
      if (existingKeyTypeFk.is_static) {
        console.error(
          'Key type with column (FK) is static:',
          existingKeyTypeFk,
        );
        return HttpStatus.FORBIDDEN;
      }

      await queryRunner.manager.remove(
        SchemaColumnKeyColumn,
        existingKeyTypeFk,
      ); // remove key type

      // KEY TYPE FK
      // GET COLUMN KEY ID FK
      const columnKeyIdPk = await queryRunner.manager.findOne(SchemaColumnKey, {
        where: { type: entityKeyType.PRIMARY_KEY },
      });
      if (!columnKeyIdPk) {
        console.error('Key type not found');
        return HttpStatus.NOT_FOUND;
      }
      console.log('columnKeyIdPk', columnKeyIdPk);

      // Check if the key type already exists

      const existingKeyTypePk = await queryRunner.manager.findOne(
        SchemaColumnKeyColumn,
        {
          where: {
            id_column_key: columnKeyIdPk.id,
            id_schema_column: data.columnIdFather,
          },
        },
      );
      if (!existingKeyTypePk) {
        console.error(
          'Key type with column (PK) does not exist:',
          existingKeyTypePk,
        );
        return HttpStatus.NOT_FOUND;
      }
      if (!existingKeyTypePk.is_static) {
        console.error(
          'Key type with column (PK) is static:',
          existingKeyTypePk,
        );
        await queryRunner.manager.remove(
          SchemaColumnKeyColumn,
          existingKeyTypePk,
        ); // remove key type
        console.log('I am removing the relation with key type PK: ', data);
      }

      await queryRunner.commitTransaction();
      return HttpStatus.OK;
    } catch (error) {
      console.error('Error updating relation with key type: ', error);
      return HttpStatus.BAD_REQUEST;
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
