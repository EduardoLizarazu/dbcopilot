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
import { DataSource, QueryRunner } from "typeorm";
import {
  TSchemaCtxColumnProfileDto,
  TSchemaCtxSchemaDto,
} from "@/core/application/dtos/schemaCtx.dto";

export class NlqQaInformationAdapter implements INlqQaInformationPort {
  constructor(
    private readonly logger: ILogger,
    private readonly oracleProvider: OracleProvider,
    private readonly typeOrmProvider: TypeOrmProvider
  ) {}
  async _BasicProfileQuery(data: {
    schemaName: string;
    tableName: string;
    columnName: string;
  }) {
    return {
      maxValue: `SELECT MAX(${data.columnName}) AS max_value FROM ${data.schemaName}.${data.tableName}`,
      minValue: `SELECT MIN(${data.columnName}) AS min_value FROM ${data.schemaName}.${data.tableName}`,
      countNulls: `SELECT COUNT(*) AS count_nulls FROM ${data.schemaName}.${data.tableName} WHERE ${data.columnName} IS NULL`,
      countUnique: `SELECT COUNT(DISTINCT ${data.columnName}) AS count_unique FROM ${data.schemaName}.${data.tableName}`,
    };
  }
  async _SampleUniqueQuery(data: {
    dbType: string;
    schemaName: string;
    tableName: string;
    columnName: string;
    limit: number;
  }) {
    if (data.dbType === "oracle") {
      return `SELECT DISTINCT ${data.columnName} as sample_unique FROM ${data.schemaName}.${data.tableName} WHERE ${data.columnName} IS NOT NULL AND ROWNUM <= ${data.limit}`;
    }
    if (data.dbType === "postgres") {
      return `SELECT DISTINCT ${data.columnName} as sample_unique FROM ${data.schemaName}.${data.tableName} WHERE ${data.columnName} IS NOT NULL LIMIT ${data.limit}`;
    }
    if (data.dbType === "mysql") {
      return `SELECT DISTINCT ${data.columnName} as sample_unique FROM ${data.schemaName}.${data.tableName} WHERE ${data.columnName} IS NOT NULL LIMIT ${data.limit}`;
    }
    if (data.dbType === "mssql") {
      return `SELECT DISTINCT TOP(${data.limit}) ${data.columnName} as sample_unique FROM ${data.schemaName}.${data.tableName} WHERE ${data.columnName} IS NOT NULL`;
    }
  }
  async _DataTypeProfileQueryNotAllow(dataType: string) {
    // Common large / binary / unindexable types across Oracle, Postgres, MySQL/MariaDB, MSSQL
    const notAllowTypes = [
      // Text / large text
      "TEXT",
      "MEDIUMTEXT",
      "LONGTEXT",
      "CLOB",
      "NCLOB",
      "NTEXT",
      // Binary / blob
      "BLOB",
      "MEDIUMBLOB",
      "LONGBLOB",
      "BYTEA",
      "IMAGE",
      // JSON/XML/geospatial (optionally skip depending on needs)
      "JSON",
      "JSONB",
      "XML",
      "GEOMETRY",
      "GEOGRAPHY",
    ];
    return notAllowTypes.includes(String(dataType || "").toUpperCase());
  }
  async extractProfile(data: {
    connection: TNlqInfoConnDto;
    schema: {
      schemaName: string;
      tableName: string;
      columnName: string;
      dataType: string;
    };
    top: number;
  }): Promise<TSchemaCtxColumnProfileDto | null> {
    let queryRunner: QueryRunner | null = null;
    let dataSource: DataSource | null = null;
    try {
      this.logger.info(
        "[NlqQaInformationAdapter] Extracting schema from connection",
        JSON.stringify(data.connection)
      );
      dataSource = await this.typeOrmProvider.createDataSource({
        type: data.connection.type,
        host: data.connection.host,
        port: data.connection.port,
        username: data.connection.username,
        password: data.connection.password,
        database: data.connection.database,
        sid: data.connection.sid,
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

      const basicQueries = await this._BasicProfileQuery({
        schemaName: data.schema.schemaName,
        tableName: data.schema.tableName,
        columnName: data.schema.columnName,
      });

      const sampleUniqueQuery = await this._SampleUniqueQuery({
        dbType: data.connection.type,
        schemaName: data.schema.schemaName,
        tableName: data.schema.tableName,
        columnName: data.schema.columnName,
        limit: data.top,
      });

      const maxValue = await queryRunner.query(basicQueries.maxValue);
      const minValue = await queryRunner.query(basicQueries.minValue);
      const countNulls = await queryRunner.query(basicQueries.countNulls);
      const countUnique = await queryRunner.query(basicQueries.countUnique);
      const sampleUnique = await queryRunner.query(sampleUniqueQuery);

      const getValue = (row: any, alias: string) => {
        if (!row) return null;
        // try common casings
        return (
          row[alias.toUpperCase()] ??
          row[alias.toLowerCase()] ??
          row[alias] ??
          // camel case
          row[alias.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] ??
          // fallback to first column value
          Object.values(row)[0]
        );
      };

      const result: TSchemaCtxColumnProfileDto = {
        maxValue: getValue(maxValue && maxValue[0], "max_value") ?? null,
        minValue: getValue(minValue && minValue[0], "min_value") ?? null,
        countNulls: Number(
          getValue(countNulls && countNulls[0], "count_nulls") ?? 0
        ),
        countUnique: Number(
          getValue(countUnique && countUnique[0], "count_unique") ?? 0
        ),
        sampleUnique: (Array.isArray(sampleUnique)
          ? sampleUnique.map((row: any) => getValue(row, "sample_unique"))
          : []
        ).filter((v) => v !== undefined && v !== null),
      };

      this.logger.info(
        "[NlqQaInformationAdapter] Schema extracted from connection",
        JSON.stringify({ result: result })
      );

      return result;
    } catch (error) {
      this.logger.error(
        "[NlqQaInformationAdapter] Error extracting profile",
        error.message
      );
      throw new Error(error.message || "Error extracting profile");
    } finally {
      if (queryRunner) await queryRunner.release();
      if (dataSource) await dataSource.destroy();
    }
  }
  async extractSchemaFromConnection(
    connection: TNlqInfoConnDto
  ): Promise<TNlqQaInformationSchemaExtractionDto> {
    let queryRunner: QueryRunner | null = null;
    let dataSource: DataSource | null = null;
    try {
      this.logger.info(
        "[NlqQaInformationAdapter] Extracting schema from connection",
        JSON.stringify(connection)
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
        JSON.stringify({ result: result })
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
    let queryRunner: QueryRunner | null = null;
    let dataSource: DataSource | null = null;
    try {
      this.logger.info(
        "[NlqQaInformationAdapter] Executing query from connection",
        { data, dateParams }
      );
      dataSource = await this.typeOrmProvider.createDataSource({
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
      //       const result = await queryRunner.query(`select pb7_filial "Sucursal",
      //        pb7_produt "Producto",
      //        b1_desc "Desc. Producto",
      //        pb7_qtde "Cantidad",
      //        pb7_data "Fecha Ingreso Balanza",
      //        pb7_dsaida "Fecha Salida Balanza",
      //        pb7_pedido "Pedido-Datos Cofer",
      //        pb7_placa "Placa",
      //        pb7_chofer "Chofer",
      //        pb7_telefo "Teléfono",
      //        pb7_docume "DOCUMENTO",
      //        pb7_qtde "Cantidad de Entrega",
      //        pb7_pbruto "P.BRUTO",
      //        pb7_ptara "TARA",
      //        pb7_observ "OBS.",
      //        pb7_xobs "OBS. DE ENTREGA",
      //        pb7_xzafra "ZAFRA"
      //   from tmprd.pb7300 pb7,
      //        tmprd.sb1300 sb1
      //  where
      //     pb7_produt = b1_cod
      //  order by
      //             pb7_data,
      //           pb7_pedido`);

      this.logger.info(
        "[NlqQaInformationAdapter] Query executed from connection",
        { data, result }
      );
      return { data: result };
    } catch (error) {
      this.logger.error("Error executing query from connection", error.message);
      throw new Error(error instanceof Error ? error.message : String(error));
    } finally {
      if (queryRunner) await queryRunner.release();
      if (dataSource) await dataSource.destroy();
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
