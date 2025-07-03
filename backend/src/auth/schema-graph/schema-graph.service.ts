import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchemaGraphDto } from './dto/create-schema-graph.dto';
import { UpdateSchemaGraphDto } from './dto/update-schema-graph.dto';
import { Neo4jService } from 'src/neo4j/neo4j/neo4j.service';
import { BadRequestError } from 'openai';
import { DataSource } from 'typeorm';
import { SchemaGraph } from './entities/schema-graph.entity';

@Injectable()
export class SchemaGraphService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}

  create(createSchemaGraphDto: CreateSchemaGraphDto) {
    return 'This action adds a new schemaGraph';
  }

  async findAll() {
    try {
      const cypher = `
      MATCH (table:Table)-[:HAS_COLUMN]->(column:Column)
      WITH table, COLLECT({
          column_neo4j_id: id(column),
          column_name: column.name,
          column_alias: column.alias,
          column_description: column.description,
          column_key_type: column.key_type,
          column_type: column.type
      }) AS columns // Collects specific column properties into a list for each table
      RETURN
        id(table) AS table_neo4j_id,
        table.name AS table_name,
        table.alias AS table_alias,
        table.description AS table_description,
        columns AS columns // Returns the collected list of column objects
      `;
      const result = await this.neo4jService.read(cypher);
      return result;
    } catch (error) {
      console.error(`Error on finding all graph: ${error}`);
      throw new BadRequestException('Error on finding all graph');
    }
  }

  async findAllByRoleId(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const roleSchemaGraph = await queryRunner.manager.find(SchemaGraph, {
        where: { roleId: id },
      });
      // queryRunner.commitTransaction();
      return roleSchemaGraph;
    } catch (error) {
      // queryRunner.rollbackTransaction();
      console.error(`Error on finding graph by role id: ${error}`);
      throw new BadRequestException('Error on finding graph by role id');
    } finally {
      queryRunner.release();
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} schemaGraph`;
  }

  async findAllByRoleIdOnGraph(id: number) {
    try {
      const rolesSchemaGraphFromDb = await this.findAllByRoleId(id);
      if (!rolesSchemaGraphFromDb || rolesSchemaGraphFromDb.length === 0) {
        return [];
      }

      const allowedTableColumns = rolesSchemaGraphFromDb.map((item) => ({
        tableId: item.tableId,
        columnId: item.columnId,
      }));

      const cypher = `
        UNWIND $allowedTableColumns AS allowed
        MATCH (table:Table) WHERE id(table) = allowed.tableId
        MATCH (column:Column) WHERE id(column) = allowed.columnId
        MATCH (table)-[:HAS_COLUMN]->(column)
        WITH table, column
        ORDER BY column.name
        WITH 
          id(table) AS tableId,
          table.name AS tableName,
          table.alias AS tableAlias,
          table.description AS tableDescription,
          collect({
            column_type: column.type,
            column_alias: column.alias,
            column_key_type: column.key_type,
            column_name: column.name,
            column_description: column.description,
            column_neo4j_id: id(column)
          }) AS columns
        RETURN {
          table_neo4j_id: tableId,
          table_name: tableName,
          table_alias: tableAlias,
          table_description: tableDescription,
          columns: columns
        } AS tableData
      `;

      const result = await this.neo4jService.read(cypher, {
        allowedTableColumns,
      });
      return result;
      // Process the result array directly
      return result.map((record) => record.get('tableData'));
    } catch (error) {
      console.error(`Error on finding all graph by role id: ${error}`);
      throw new BadRequestException('Error on finding all graph by role id');
    }
  }

  async update(id: number, updateSchemaGraphDto: UpdateSchemaGraphDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      console.log('schema-graph.service update: ', id, updateSchemaGraphDto);

      // 1. Remove everything with role_id on schema_graph
      await queryRunner.manager.query(
        `DELETE FROM schema_graph WHERE role_id = $1`,
        [id],
      );

      // 2. Insert the new data on schema_graph(role_id, column_id, table_id)
      for (const data of updateSchemaGraphDto) {
        if (!(data.column_id || data.table_id || data.role_id)) {
          throw new BadRequestException('No empty values are allow');
        }
        await queryRunner.manager.query(
          `INSERT INTO schema_graph (role_id, column_id, table_id) VALUES ($1, $2, $3)`,
          [id, data.column_id, data.table_id],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`Error on updating graph by role id: ${error}`);
      throw new BadRequestException('Error on updating graph by role id');
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} schemaGraph`;
  }
}
