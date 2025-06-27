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
      const roleSchemaGraph = queryRunner.manager.find(SchemaGraph, {
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

  async update(id: number, updateSchemaGraphDto: UpdateSchemaGraphDto[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. Remove everything with role_id on schema_graph
      await queryRunner.query(`DELETE FROM schema_graph WHERE role_id = $1`, [
        id,
      ]);

      // 2. Insert the new data on schema_graph(role_id, column_id, table_id)
      for (const data of updateSchemaGraphDto) {
        await queryRunner.manager.query(
          `INSERT INTO schema_graph (role_id, column_id, table_id) VALUES ($1, $2, $3)`,
          [id, data.columnId, data.tableId],
        );
      }

      queryRunner.commitTransaction();
    } catch (error) {
      queryRunner.rollbackTransaction();

      console.error(`Error on updating graph by role id: ${error}`);
      throw new BadRequestException('Error on updating graph by role id');
    } finally {
      queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} schemaGraph`;
  }
}
