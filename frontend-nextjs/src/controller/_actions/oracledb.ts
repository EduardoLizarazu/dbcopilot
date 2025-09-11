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
        select sd3.d3_filial "SUCURSAL",
       sd3.d3_emissao "FECHA",
       sd3.d3_xnrotra "NOTA",
       sb1.b1_desc "PRODUCTO",
       sd3.d3_quant "BOLSA/PAQUETE",
       d3_qtsegum "QQ/L",
       d3_local "ALMACEN"
        from tmprd.sd3300 sd3,
          tmprd.sb1300 sb1
        where 
        d3_cod = b1_cod
        and d3_tm = 8
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
