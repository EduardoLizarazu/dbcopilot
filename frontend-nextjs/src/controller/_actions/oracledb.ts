"use server";
import { DataSource } from "typeorm";

export async function queryODBC() {
  const tempDataSource = new DataSource({
    type: process.env.ORACLE_TYPE as any,
    host: process.env.ORACLE_HOST,
    port: process.env.ORACLE_PORT ? parseInt(process.env.ORACLE_PORT) : 1521,
    username: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    database: process.env.ORACLE_DB,
    sid: process.env.ORACLE_SID,
    synchronize: false, // Explicitly disable synchronization
    logging: false, // Disable logging unless needed
    entities: [], // No entities needed
    migrations: [], // No migrations
    subscribers: [], // No subscribers
  });

  try {
    // Initialize the connection
    await tempDataSource.initialize();
    console.log("Temporary connection established");
    // Create a query runner for explicit control
    const queryRunner = tempDataSource.createQueryRunner();
    try {
      // Execute the query
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

      console.log("Query result:", result);
      return result;
    } catch (queryError) {
      console.error("Error executing query:", queryError);
      throw queryError;
    } finally {
      // Always release the query runner
      await queryRunner.release();
    }
  } catch (error) {
    console.error("Error executing SQL:", error);
    throw error;
  } finally {
    // Always destroy the connection when done
    if (tempDataSource.isInitialized) {
      await tempDataSource.destroy();
      console.log("Temporary connection closed");
    }
  }
}
