import {
  TNlqQaInformationSchemaExtractionDto,
  TNlqInformationData,
  TNlqInfoConnDto,
  TNlqInfoExtractorDto,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";
import { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { TypeOrmProvider } from "../providers/database/typeorm.infra.provider";

export class NlqQaInformationAdapter implements INlqQaInformationPort {
  constructor(
    private readonly logger: ILogger,
    private readonly oracleProvider: OracleProvider,
    private readonly typeOrmProvider: TypeOrmProvider
  ) {}
  async extractSchemaFromConnection(
    connection: TNlqInfoConnDto
  ): Promise<TNlqQaInformationSchemaExtractionDto> {
    let queryRunner = null;
    let dataSource = null;
    try {
      this.logger.info(
        "[NlqQaInformationAdapter] Extracting schema from connection",
        { connection }
      );
      dataSource = await this.typeOrmProvider.createDataSource({
        type: connection.type,
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: connection.password,
        database: connection.database,
        sid: connection.sid,
      });
      await dataSource.initialize();
      // check if dataSource is initialized
      if (!dataSource.isInitialized) {
        this.logger.error(
          "[NlqQaInformationAdapter] DataSource is not initialized on extract query"
        );
        throw new Error("DataSource is not initialized on extract query");
      }

      queryRunner = dataSource.createQueryRunner();

      const result = await queryRunner.query(connection.schema_query || "");

      this.logger.info(
        "[NlqQaInformationAdapter] Schema extracted from connection",
        { length: result.length, connection }
      );
      return result;
    } catch (error) {
      this.logger.error("Error extracting schema from connection", {
        error: error instanceof Error ? error.message : String(error),
        connection,
      });
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      if (queryRunner) await queryRunner.release();
      if (dataSource) await dataSource.destroy();
    }
  }
  async executeQueryFromConnection(
    data: TNlqInfoExtractorDto,
    dateParams?: { start: Date; end: Date }
  ): Promise<TNlqInformationData> {
    let queryRunner = null;
    let dataSource = null;
    try {
      this.logger.info(
        "[NlqQaInformationAdapter] Executing query from connection",
        { data, dateParams }
      );
      dataSource = this.typeOrmProvider.createDataSource({
        type: data.type,
        host: data.host,
        port: data.port,
        username: data.username,
        password: data.password,
        database: data.database,
        sid: data.sid,
      });

      await dataSource.initialize();

      // check if dataSource is initialized
      if (!dataSource.isInitialized) {
        this.logger.error(
          "[NlqQaInformationAdapter] DataSource is not initialized on execute query from connection",
          { data }
        );
        throw new Error(
          "DataSource is not initialized on execute query from connection"
        );
      }

      queryRunner = dataSource.createQueryRunner();

      const result = await queryRunner.query(data.query);

      this.logger.info(
        "[NlqQaInformationAdapter] Query executed from connection",
        { data, result }
      );
      return { data: result };
    } catch (error) {
      this.logger.error("Error executing query from connection", error.message);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
  async extractSchemaBased(
    tables: string[]
  ): Promise<TNlqQaInformationSchemaExtractionDto> {
    let queryRunner = null;
    let dataSource = null;
    try {
      dataSource = this.oracleProvider.dataSource;
      await dataSource.initialize();
      // check if dataSource is initialized
      if (!dataSource.isInitialized) {
        this.logger.error(
          "[NlqQaInformationAdapter] DataSource is not initialized on extract query"
        );
        throw new Error("DataSource is not initialized on extract query");
      }

      queryRunner = dataSource.createQueryRunner();
      const result = await queryRunner.query(`
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
        length: result.length,
      });
      return result;
    } catch (error) {
      this.logger.error("Error extracting schema", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      if (queryRunner) await queryRunner.release();
      if (dataSource) await dataSource.destroy();
    }
  }
  async executeQuery(
    query: string,
    dateParams?: { start: Date; end: Date }
  ): Promise<TNlqInformationData> {
    let queryRunner = null;
    let dataSource = null;

    try {
      dataSource = this.oracleProvider.dataSource;
      await dataSource.initialize();
      // check if dataSource is initialized
      if (!dataSource.isInitialized) {
        this.logger.error(
          "[NlqQaInformationAdapter] DataSource is not initialized on extract query"
        );
        throw new Error("DataSource is not initialized on extract query");
      }

      queryRunner = dataSource.createQueryRunner();

      this.logger.info("[NlqQaInformationAdapter] Executing query", { query });

      const result = await queryRunner.query(query);
      return {
        data: result,
      };
    } catch (error) {
      this.logger.error("Error executing query", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      if (queryRunner) await queryRunner.release();
      if (dataSource) await dataSource.destroy();
    }
  }
}
