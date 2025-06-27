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
      const cypher = `MATCH (table:Table)-[:HAS_COLUMN]->(column:Column)
        RETURN
          id(table) AS table_neo4j_id,     
          table.name AS table_name,
          table.alias AS table_alias,
          table.description AS table_description,
          id(column) AS column_neo4j_id,
          column.name AS column_name,
          column.alias AS column_alias,
          column.description AS column_description,
          column.key_type AS column_key_type,
          column.type AS column_type
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
