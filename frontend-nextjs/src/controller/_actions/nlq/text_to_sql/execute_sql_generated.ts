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
