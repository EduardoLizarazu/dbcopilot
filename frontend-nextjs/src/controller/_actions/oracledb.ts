"use server";
import { DataSource } from "typeorm";
import { encoding_for_model } from "tiktoken";

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
        SELECT DISTINCT
          c.owner        AS TABLE_SCHEMA,
          c.table_name AS TABLE_NAME,
          c.column_name AS COLUMN_NAME,
          CASE
            WHEN c.data_type IN ('CHAR','NCHAR','VARCHAR2','NVARCHAR2')
              THEN c.data_type || '(' || c.char_col_decl_length || ')'
            WHEN c.data_type IN ('NUMBER','FLOAT') AND c.data_precision IS NOT NULL AND c.data_scale IS NOT NULL
              THEN c.data_type || '(' || c.data_precision || ',' || c.data_scale || ')'
            WHEN c.data_type IN ('NUMBER','FLOAT') AND c.data_precision IS NOT NULL AND c.data_scale IS NULL
              THEN c.data_type || '(' || c.data_precision || ')'
            WHEN c.data_type IN ('RAW')
              THEN c.data_type || '(' || c.data_length || ')'
            ELSE c.data_type
          END AS DATA_TYPE
        FROM ALL_TAB_COLUMNS c
        JOIN ALL_TABLES t
          ON t.owner = c.owner
        AND t.table_name = c.table_name
        WHERE (
          c.owner = USER
          OR EXISTS (
            SELECT 1
            FROM ALL_TAB_PRIVS p
            WHERE p.table_name = c.table_name
              AND p.table_schema = c.owner
              AND p.grantee = USER
          )
        )
        ORDER BY
          c.owner, c.table_name, c.column_name
    `);

      console.log("Query result:", result);
      console.log(`Number of rows retrieved: ${result.length}`);
      const encoding = encoding_for_model("gpt-4-turbo");
      const tokens = encoding.encode(JSON.stringify(result));
      console.log(`Number of tokens used: ${tokens.length}`);
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
