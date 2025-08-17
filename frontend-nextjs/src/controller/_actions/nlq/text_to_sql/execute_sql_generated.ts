import { DataSource } from "typeorm";
export async function executeSqlGenerated(
  sql: string,
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
      const result = await queryRunner.query(sql, []);

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
