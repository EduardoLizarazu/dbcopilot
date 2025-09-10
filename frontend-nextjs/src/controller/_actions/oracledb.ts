"use server";
import { DataSource } from "typeorm";

export async function queryODBC() {
  const tempDataSource = new DataSource({
    type: "oracle",
    host: "localhost",
    port: 1521,
    username: "TMPRD",
    password: "TMPRD",
    database: "orclaguai",
    sid: "orclaguai",
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
      const result = await queryRunner.query(``);
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
