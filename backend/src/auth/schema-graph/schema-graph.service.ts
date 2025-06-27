import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchemaGraphDto } from './dto/create-schema-graph.dto';
import { UpdateSchemaGraphDto } from './dto/update-schema-graph.dto';
import { Neo4jService } from 'src/neo4j/neo4j/neo4j.service';
import { BadRequestError } from 'openai';

@Injectable()
export class SchemaGraphService {
  constructor(private readonly neo4jService: Neo4jService) {}

  create(createSchemaGraphDto: CreateSchemaGraphDto) {
    return 'This action adds a new schemaGraph';
  }

  async findAll() {
    try {
      const cypher = `
      MATCH (table:Table)-[:HAS_COLUMN]->(column:Column)
      WITH table, COLLECT({
          neo4j_id: id(column),
          name: column.name,
          alias: column.alias,
          description: column.description,
          key_type: column.key_type,
          type: column.type
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

  findOne(id: number) {
    return `This action returns a #${id} schemaGraph`;
  }

  update(id: number, updateSchemaGraphDto: UpdateSchemaGraphDto) {
    return `This action updates a #${id} schemaGraph`;
  }

  remove(id: number) {
    return `This action removes a #${id} schemaGraph`;
  }
}
