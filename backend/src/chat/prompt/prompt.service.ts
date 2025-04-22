import { Injectable } from '@nestjs/common';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { AiService } from 'src/ai/ai.service';
import { DataSource } from 'typeorm';
import { Connection } from 'src/connection/entities/connection.entity';
import { Prompt } from './entities/prompt.entity';
import { Sqlquery } from '../sqlquery/entities/sqlquery.entity';

@Injectable()
export class PromptService {
  constructor(
    private aiService: AiService,
    private dataSource: DataSource,
  ) {}

  async handleUserPrompt(connectionId: number, userPrompt: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. Get connection and schema
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
          },
        },
      });
      if (!connection) {
        throw new Error(`Connection with ID ${connectionId} not found`);
      }
      console.log('connection: ', connection);

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

      console.log('selecting schema data: ', schemaData[0]);

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
      const schema = schemaDataArray;

      console.log('generating queries ai service ...');

      // 2. Generate SQL with ChatGPT
      const { queries, finalQuery } = await this.aiService.generateSQL(
        userPrompt,
        schema,
      );

      // 3. Execute the final query
      // const dbClient = this.databaseService.getClient(connection);
      // const result = await dbClient.query(finalQuery);
      const dataSource = new DataSource({
        type: connection?.databasetype.type as any, // Cast to TypeORM's DatabaseType
        host: connection?.dbHost,
        port: connection?.dbPort,
        username: connection?.dbUsername,
        password: connection?.dbPassword,
        database: connection?.dbName,
        synchronize: false,
        logging: false,
      });

      const db = await dataSource.initialize();
      const result = await db.query(`${finalQuery}`);
      await dataSource.destroy(); // Close connection after test

      // 4. Save to database
      const savedPrompt = await queryRunner.manager.save(Prompt, {
        connectionId,
        title: userPrompt.substring(0, 50),
        prompt: userPrompt,
      });

      await queryRunner.manager.save(Sqlquery, {
        query: finalQuery,
        prompt: { id: savedPrompt.id } as Prompt,
      });
      await queryRunner.commitTransaction();
      return {
        data: result,
        generated_queries: queries,
        final_query: finalQuery,
      };
    } catch (error) {
      console.error('Error handling user prompt:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  create(createPromptDto: CreatePromptDto) {
    return 'This action adds a new prompt';
  }

  findAll() {
    return `This action returns all prompt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prompt`;
  }

  update(id: number, updatePromptDto: UpdatePromptDto) {
    return `This action updates a #${id} prompt`;
  }

  remove(id: number) {
    return `This action removes a #${id} prompt`;
  }
}
