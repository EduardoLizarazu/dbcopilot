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
) {
  // Create a temporary data source
  const tempDataSource = new DataSource({
    type: config.type,
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    synchronize: false, // Explicitly disable synchronization
    logging: false, // Disable logging unless needed
    entities: [], // No entities needed
    migrations: [], // No migrations
    subscribers: [], // No subscribers
    extra: {
      max: 1, // Limit pool size since we're doing a single query
      connectionTimeoutMillis: 5000, // Timeout after 5 seconds
    },
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
