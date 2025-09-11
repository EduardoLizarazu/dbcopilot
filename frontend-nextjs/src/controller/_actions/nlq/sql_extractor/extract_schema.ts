import { DataSource } from "typeorm";
import { postgresSqlExtractor } from "./postgres";
import { oracleSqlExtractor } from "./oracle";
import { sqlServerSqlExtractor } from "./sqlserver";

export async function extractSchema(
  //   sql: string,
  params: any[] = [],
  config: {
    type: "postgres" | "mysql" | "sqlite" | "mariadb" | "mssql" | "oracle";
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }
): Promise<any> {
  // Create a temporary data source
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
      // const result = await queryRunner.query(sql, params);
      const dbType = config.type;
      let result = null;
      switch (dbType) {
        case "postgres":
          result = await queryRunner.query(postgresSqlExtractor, params);
          break;
        case "oracle":
          result = await queryRunner.query(oracleSqlExtractor, params);
          console.log("Oracle extractor result:", result);
          break;
        case "mssql":
          result = await queryRunner.query(sqlServerSqlExtractor, params);
          break;
        default:
          throw new Error(`Unsupported database type: ${dbType}`);
      }

      return result;
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
