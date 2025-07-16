import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { Neo4jService } from 'src/neo4j/neo4j/neo4j.service';
import { DataSource } from 'typeorm';

type SchemaPhysical = {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  referenced_table_schema: string | null;
  referenced_table_name: string | null;
  referenced_column_name: string | null;
};

type SchemaContextualized = {
  id_table_schema: number;
  id_table: number;
  id_column: number;
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  referenced_table_schema: string | null;
  referenced_table_name: string | null;
  referenced_column_name: string | null;
  id_referenced_table_schema: number | null;
  id_referenced_table_name: number | null;
  id_referenced_column_name: number | null;
};

type TSchemaDiff = {
  type: 'MISMATCH' | 'MISSING_IN_CONTEXT' | 'MISSING_IN_PHYSICAL';
  table_schema: string;
  table_name: string;
  column_name: string;
  physical_data?: Partial<SchemaPhysical>;
  contextual_data?: Partial<SchemaContextualized>;
  mismatch_details?: string[];
};

@Injectable()
export class SchemaService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private dataSource: DataSource, // Inject the DataSource for transaction management
  ) {}
  create(createSchemaDto: CreateSchemaDto) {
    return 'This action adds a new schema';
  }

  async findDiff() {
    try {
      const dataSource = new DataSource({
        type: process.env.EXTERNAL_DB_TYPE as any, // Cast to TypeORM's DatabaseType
        host: process.env.EXTERNAL_DB_HOST,
        port: process.env.EXTERNAL_DB_PORT as unknown as number,
        username: process.env.EXTERNAL_DB_USER,
        password: process.env.EXTERNAL_DB_PASSWORD,
        database: process.env.EXTERNAL_DB_NAME,
        synchronize: false,
        logging: false,
      });
      const extract_schema_rdb = `
      SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    c.data_type,
    CASE WHEN pk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_primary_key,
    CASE WHEN fk.column_name IS NOT NULL THEN TRUE ELSE FALSE END AS is_foreign_key,
    fk.foreign_table_schema AS referenced_table_schema,
    fk.foreign_table_name AS referenced_table_name,
    fk.foreign_column_name AS referenced_column_name
FROM
    information_schema.columns AS c
LEFT JOIN ( -- Subquery to identify Primary Key columns
    SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name
    FROM
        information_schema.table_constraints AS tc
    JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
    WHERE
        tc.constraint_type = 'PRIMARY KEY'
) AS pk ON c.table_schema = pk.table_schema
        AND c.table_name = pk.table_name
        AND c.column_name = pk.column_name
LEFT JOIN ( -- Subquery to identify Foreign Key columns and their references
    SELECT
        kcu.table_schema,
        kcu.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM
        information_schema.table_constraints AS tc
    JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
    JOIN
        information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE
        tc.constraint_type = 'FOREIGN KEY'
) AS fk ON c.table_schema = fk.table_schema
        AND c.table_name = fk.table_name
        AND c.column_name = fk.column_name
WHERE
    c.table_schema NOT IN ('pg_catalog', 'information_schema') -- Exclude system schemas
    AND c.table_name NOT LIKE 'pg_%' -- Further filter out some internal PostgreSQL tables
ORDER BY
    c.table_schema,
    c.table_name,
    c.ordinal_position;
      `;
      const physicalDb = await dataSource.initialize();
      const physicalSchema: SchemaPhysical[] =
        await physicalDb.query(extract_schema_rdb);
      await physicalDb.destroy();

      const extract_schema_cypher = `
        MATCH (sch:Schema)-[:HAS_TABLE]->(tbl:Table)-[:HAS_COLUMN]->(col:Column)
        OPTIONAL MATCH (tbl)-[rel:RELATED_TO]->(refTbl:Table)
        WHERE rel.from_column = col.name
        OPTIONAL MATCH (refSch:Schema)-[:HAS_TABLE]->(refTbl)
        OPTIONAL MATCH (refTbl)-[:HAS_COLUMN]->(refCol:Column {name: rel.to_column})
        RETURN
          id(sch) AS id_table_schema,
          id(tbl) AS id_table,
          id(col) AS id_column,
          sch.name AS table_schema,
          tbl.name AS table_name,
          col.name AS column_name,
          col.type AS data_type,
          CASE 
            WHEN col.key_type CONTAINS 'PRIMARY' THEN true 
            ELSE false 
          END AS is_primary_key,
          CASE 
            WHEN rel IS NOT NULL THEN true 
            ELSE false 
          END AS is_foreign_key,
          COALESCE(refSch.name, null) AS referenced_table_schema,
          COALESCE(refTbl.name, null) AS referenced_table_name,
          COALESCE(rel.to_column, null) AS referenced_column_name,
          id(refSch) AS id_referenced_table_schema,
          id(refTbl) AS id_referenced_table,
          id(refCol) AS id_referenced_column
        ORDER BY table_schema, table_name, column_name
      `;
      const contextualizedSchema = await this.neo4jService.read(
        extract_schema_cypher,
        {},
      );

      const contextualizedSchemaFormat: SchemaContextualized[] = [];

      contextualizedSchema.forEach((record) => {
        return contextualizedSchemaFormat.push({
          //  Source node IDs
          id_table_schema: record['id_table_schema'],
          id_table: record['id_table'],
          id_column: record['id_column'],

          // Source schema details
          table_schema: record['table_schema'],
          table_name: record['table_name'],
          column_name: record['column_name'],
          data_type: record['data_type'],
          is_primary_key: record['is_primary_key'],
          is_foreign_key: record['is_foreign_key'],

          // Reference details (names)
          referenced_table_schema: record['referenced_table_schema'],
          referenced_table_name: record['referenced_table_name'],
          referenced_column_name: record['referenced_column_name'],

          // Reference node IDs
          id_referenced_table_schema: record['id_referenced_table_schema'],
          id_referenced_table_name: record['id_referenced_table'],
          id_referenced_column_name: record['id_referenced_column'],
        });
      });

      const mismatches = this.detectSchemaMismatches(
        physicalSchema,
        contextualizedSchemaFormat,
      );
      return mismatches;
    } catch (error) {
      console.error(`Error find schema diff: ${error}`);
      throw new BadRequestException('Error on finding schema diff');
    } finally {
    }
  }

  detectSchemaMismatches(
    physicalSchemas: SchemaPhysical[],
    contextualizedSchemas: SchemaContextualized[],
  ): TSchemaDiff[] {
    const diffs: TSchemaDiff[] = [];

    // Create lookup maps for both schemas
    const physicalMap = new Map<string, SchemaPhysical>();
    physicalSchemas.forEach((physical) => {
      const key = `${physical.table_schema}|${physical.table_name}|${physical.column_name}`;
      physicalMap.set(key, physical);
    });

    const contextualMap = new Map<string, SchemaContextualized>();
    contextualizedSchemas.forEach((contextualized) => {
      const key = `${contextualized.table_schema}|${contextualized.table_name}|${contextualized.column_name}`;
      contextualMap.set(key, contextualized);
    });

    // Check for mismatches and missing in physical
    contextualizedSchemas.forEach((contextualized) => {
      const key = `${contextualized.table_schema}|${contextualized.table_name}|${contextualized.column_name}`;
      const physical = physicalMap.get(key);

      if (!physical) {
        // Column exists in contextualized but not in physical
        diffs.push({
          type: 'MISSING_IN_PHYSICAL',
          table_schema: contextualized.table_schema,
          table_name: contextualized.table_name,
          column_name: contextualized.column_name,
          contextual_data: contextualized,
        });
        return;
      }

      // Check for property mismatches
      const mismatchReasons: string[] = [];

      const checkProperty = <K extends keyof SchemaPhysical>(
        propName: K,
        physicalVal: SchemaPhysical[K],
        contextVal: SchemaContextualized[K],
      ) => {
        if (physicalVal !== contextVal) {
          mismatchReasons.push(
            `${propName} mismatch (physical: ${physicalVal}, contextual: ${contextVal})`,
          );
        }
      };

      checkProperty('data_type', physical.data_type, contextualized.data_type);
      checkProperty(
        'is_primary_key',
        physical.is_primary_key,
        contextualized.is_primary_key,
      );
      checkProperty(
        'is_foreign_key',
        physical.is_foreign_key,
        contextualized.is_foreign_key,
      );
      checkProperty(
        'referenced_table_schema',
        physical.referenced_table_schema,
        contextualized.referenced_table_schema,
      );
      checkProperty(
        'referenced_table_name',
        physical.referenced_table_name,
        contextualized.referenced_table_name,
      );
      checkProperty(
        'referenced_column_name',
        physical.referenced_column_name,
        contextualized.referenced_column_name,
      );

      if (mismatchReasons.length > 0) {
        diffs.push({
          type: 'MISMATCH',
          table_schema: physical.table_schema,
          table_name: physical.table_name,
          column_name: physical.column_name,
          physical_data: physical,
          contextual_data: contextualized,
          mismatch_details: mismatchReasons,
        });
      }
    });

    // Check for columns missing in contextualized schema
    physicalSchemas.forEach((physical) => {
      const key = `${physical.table_schema}|${physical.table_name}|${physical.column_name}`;
      if (!contextualMap.has(key)) {
        diffs.push({
          type: 'MISSING_IN_CONTEXT',
          table_schema: physical.table_schema,
          table_name: physical.table_name,
          column_name: physical.column_name,
          physical_data: physical,
        });
      }
    });

    return diffs;
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
