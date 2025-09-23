import {
  TNlqQaInformationSchemaExtractionDto,
  TNlqInformationData,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";

export class NlqQaInformationAdapter implements INlqQaInformationPort {
  constructor(
    private readonly logger: ILogger,
    private readonly oracleProvider: OracleProvider
  ) {}
  async extractSchemaBased(
    tables: string[]
  ): Promise<TNlqQaInformationSchemaExtractionDto> {
    try {
      const dataSource = this.oracleProvider.dataSource;
      const result = await dataSource.query(`
        SELECT
    ac.owner                               AS table_schema,
    ac.table_name,
    ac.column_name,
    ac.data_type,
    ac.data_length,
    ac.data_precision,
    ac.data_scale,
    ac.nullable,
    CASE WHEN pk_cols.column_name IS NOT NULL THEN 'TRUE' ELSE 'FALSE' END AS is_primary_key,
    CASE WHEN fk_cols.column_name IS NOT NULL THEN 'TRUE' ELSE 'FALSE' END AS is_foreign_key,
    fk_ref_cons.r_owner                    AS referenced_table_schema,
    fk_ref_cons.r_table_name               AS referenced_table_name,
    fk_ref_cols.column_name                AS referenced_column_name
FROM
    ALL_TAB_COLUMNS ac
LEFT JOIN (
    -- Columnas que participan en PRIMARY KEY del mismo owner
    SELECT
        acc.owner,
        acc.table_name,
        acc.column_name
    FROM ALL_CONSTRAINTS cons
    JOIN ALL_CONS_COLUMNS acc
      ON cons.owner = acc.owner
     AND cons.constraint_name = acc.constraint_name
    WHERE cons.constraint_type = 'P'
      AND cons.owner = 'TMPRD'          -- limita al owner objetivo
) pk_cols
  ON ac.owner = pk_cols.owner
 AND ac.table_name = pk_cols.table_name
 AND ac.column_name = pk_cols.column_name
LEFT JOIN (
    -- Columnas que participan en FOREIGN KEY del mismo owner
    SELECT
        acc.owner,
        acc.table_name,
        acc.column_name,
        acc.position,
        cons.r_owner,                    -- esquema referenciado
        cons.r_constraint_name           -- constraint referenciada (PK/Unique en la tabla padre)
    FROM ALL_CONSTRAINTS cons
    JOIN ALL_CONS_COLUMNS acc
      ON cons.owner = acc.owner
     AND cons.constraint_name = acc.constraint_name
    WHERE cons.constraint_type = 'R'
      AND cons.owner = 'TMPRD'          -- limita al owner objetivo
) fk_cols
  ON ac.owner = fk_cols.owner
 AND ac.table_name = fk_cols.table_name
 AND ac.column_name = fk_cols.column_name
LEFT JOIN (
    -- Detalle de la constraint referenciada (en la tabla padre)
    SELECT
        owner        AS r_owner,
        constraint_name,
        table_name   AS r_table_name
    FROM ALL_CONSTRAINTS
    WHERE constraint_type IN ('P','U')  -- la referenciada debe ser PK o UNIQUE
) fk_ref_cons
  ON fk_cols.r_owner = fk_ref_cons.r_owner
 AND fk_cols.r_constraint_name = fk_ref_cons.constraint_name
LEFT JOIN (
    -- Columnas específicas referenciadas, matcheadas por posición
    SELECT
        owner,
        constraint_name,
        column_name,
        position
    FROM ALL_CONS_COLUMNS
) fk_ref_cols
  ON fk_ref_cons.r_owner = fk_ref_cols.owner
 AND fk_ref_cons.constraint_name = fk_ref_cols.constraint_name
 AND fk_cols.position = fk_ref_cols.position
WHERE
    ac.owner = 'TMPRD'                   -- << SOLO tablas/columnas del usuario TMPRD
ORDER BY
    ac.owner,
    ac.table_name,
    ac.column_id    
        
        `);
      this.logger.info("[NlqQaInformationInfraRepository] Schema extracted", {
        result,
      });
      return result;
    } catch (error) {
      this.logger.error("Error extracting schema", error);
      throw error;
    }
  }
  async executeQuery(
    query: string,
    dateParams?: { start: Date; end: Date }
  ): Promise<TNlqInformationData> {
    try {
      const dataSource = this.oracleProvider.dataSource;
      const result = await dataSource.query(query);
      return result;
    } catch (error) {
      this.logger.error("Error executing query", error);
      throw error;
    }
  }
}
