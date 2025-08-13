import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { UpdateSchemaDto } from './dto/update-schema.dto';
import { Neo4jService } from 'src/neo4j/neo4j/neo4j.service';
import { DataSource } from 'typeorm';
import * as neo4j from 'neo4j-driver';

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

  async updateDiff(diffs: TSchemaDiff[]) {
    try {
      // Create a session for the transaction
      const session = this.neo4jService.getSession({
        accessMode: neo4j.session.WRITE,
      });
      const tx = session.beginTransaction();

      try {
        for (const diff of diffs) {
          switch (diff.type) {
            case 'MISMATCH':
              await this.handleMismatch(tx, diff);
              break;
            case 'MISSING_IN_CONTEXT':
              await this.handleMissingInContext(tx, diff);
              break;
            case 'MISSING_IN_PHYSICAL':
              await this.handleMissingInPhysical(tx, diff);
              break;
          }
        }

        await tx.commit();
        return {
          success: true,
          message: 'Schema differences applied successfully',
        };
      } catch (error) {
        await tx.rollback();
        throw new Error(`Transaction failed: ${error.message}`);
      } finally {
        await session.close();
      }
    } catch (error) {
      throw new Error(`Schema update failed: ${error.message}`);
    }
  }

  private async handleMismatch(tx: neo4j.Transaction, diff: TSchemaDiff) {
    if (!diff.contextual_data || !diff.physical_data) {
      console.warn('Skipping MISMATCH due to missing data', diff);
      return;
    }

    // Update column properties
    await tx.run(
      `MATCH (col:Column) WHERE id(col) = $id_column
       SET col.data_type = $data_type,
           col.is_primary_key = $is_primary_key,
           col.is_foreign_key = $is_foreign_key`,
      {
        id_column: diff.contextual_data.id_column,
        data_type: diff.physical_data.data_type,
        is_primary_key: diff.physical_data.is_primary_key,
        is_foreign_key: diff.physical_data.is_foreign_key,
      },
    );

    // Handle foreign key relationships
    await this.updateForeignKeyRelations(tx, diff);
  }

  private async updateForeignKeyRelations(
    tx: neo4j.Transaction,
    diff: TSchemaDiff,
  ) {
    if (!diff.contextual_data || !diff.physical_data) return;

    // Delete old relationship if exists
    await tx.run(
      `MATCH (tbl:Table)-[rel:RELATED_TO]->(:Table)
       WHERE id(tbl) = $id_table AND rel.from_column = $column_name
       DELETE rel`,
      {
        id_table: diff.contextual_data.id_table,
        column_name: diff.column_name,
      },
    );

    // Create new relationship if needed
    if (
      diff.physical_data.is_foreign_key &&
      diff.physical_data.referenced_table_schema &&
      diff.physical_data.referenced_table_name &&
      diff.physical_data.referenced_column_name
    ) {
      await tx.run(
        `MATCH (from:Table) WHERE id(from) = $from_id
         MATCH (refSch:Schema {name: $ref_schema})-[:HAS_TABLE]->(to:Table {name: $ref_table})
         MERGE (from)-[:RELATED_TO {
           from_column: $from_column,
           to_column: $to_column
         }]->(to)`,
        {
          from_id: diff.contextual_data.id_table,
          ref_schema: diff.physical_data.referenced_table_schema,
          ref_table: diff.physical_data.referenced_table_name,
          from_column: diff.column_name,
          to_column: diff.physical_data.referenced_column_name,
        },
      );
    }
  }

  private async handleMissingInContext(
    tx: neo4j.Transaction,
    diff: TSchemaDiff,
  ) {
    if (!diff.physical_data) {
      console.warn(
        'Skipping MISSING_IN_CONTEXT due to missing physical_data',
        diff,
      );
      return;
    }

    // Create schema, table, and column
    await tx.run(
      `MERGE (sch:Schema {name: $schema})
       MERGE (tbl:Table {name: $table, schema: $schema})
       MERGE (sch)-[:HAS_TABLE]->(tbl)
       MERGE (col:Column {name: $column, table: $table, schema: $schema})
         ON CREATE SET col.data_type = $data_type,
                      col.is_primary_key = $is_primary_key,
                      col.is_foreign_key = $is_foreign_key
       MERGE (tbl)-[:HAS_COLUMN]->(col)`,
      {
        schema: diff.table_schema,
        table: diff.table_name,
        column: diff.column_name,
        data_type: diff.physical_data.data_type,
        is_primary_key: diff.physical_data.is_primary_key,
        is_foreign_key: diff.physical_data.is_foreign_key,
      },
    );

    // Create foreign key relationship if needed
    if (
      diff.physical_data.is_foreign_key &&
      diff.physical_data.referenced_table_schema &&
      diff.physical_data.referenced_table_name &&
      diff.physical_data.referenced_column_name
    ) {
      await tx.run(
        `MATCH (from:Table {schema: $from_schema, name: $from_table})
         MATCH (to:Table {schema: $ref_schema, name: $ref_table})
         MERGE (from)-[:RELATED_TO {
           from_column: $from_column,
           to_column: $to_column
         }]->(to)`,
        {
          from_schema: diff.table_schema,
          from_table: diff.table_name,
          from_column: diff.column_name,
          ref_schema: diff.physical_data.referenced_table_schema,
          ref_table: diff.physical_data.referenced_table_name,
          to_column: diff.physical_data.referenced_column_name,
        },
      );
    }
  }

  private async handleMissingInPhysical(
    tx: neo4j.Transaction,
    diff: TSchemaDiff,
  ) {
    if (
      !diff.contextual_data ||
      !diff.contextual_data.id_column ||
      !diff.contextual_data.id_table ||
      !diff.contextual_data.id_table_schema
    ) {
      console.warn(
        'Skipping MISSING_IN_PHYSICAL due to missing contextual_data or required IDs',
        diff,
      );
      return;
    }

    // Delete column and its relationships
    await tx.run(
      `MATCH (col:Column) WHERE id(col) = $id_column
       OPTIONAL MATCH (tbl:Table)-[rel:RELATED_TO]->(:Table)
         WHERE id(tbl) = $id_table AND rel.from_column = $column_name
       DELETE rel
       DETACH DELETE col`,
      {
        id_column: diff.contextual_data.id_column,
        id_table: diff.contextual_data.id_table,
        column_name: diff.column_name,
      },
    );

    // Clean up orphaned tables and schemas
    await this.cleanOrphanedTables(tx, diff.contextual_data.id_table);
    await this.cleanOrphanedSchemas(tx, diff.contextual_data.id_table_schema);
  }

  private async cleanOrphanedTables(tx: neo4j.Transaction, tableId: number) {
    await tx.run(
      `MATCH (tbl:Table) WHERE id(tbl) = $table_id
       WITH tbl, size((tbl)-[:HAS_COLUMN]->()) AS column_count
       WHERE column_count = 0
       DETACH DELETE tbl`,
      { table_id: tableId },
    );
  }

  private async cleanOrphanedSchemas(tx: neo4j.Transaction, schemaId: number) {
    await tx.run(
      `MATCH (sch:Schema) WHERE id(sch) = $schema_id
       WITH sch, size((sch)-[:HAS_TABLE]->()) AS table_count
       WHERE table_count = 0
       DETACH DELETE sch`,
      { schema_id: schemaId },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} schema`;
  }
}
