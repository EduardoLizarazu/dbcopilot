// Typeorm provider class for Oracle database
import { DataSource } from "typeorm";

type OracleConnectionOptions = {
  type: "oracle";
  host: string;
  port: number;
  username: string;
  password: string;
  sid: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  subscribers: string[];
};

export class OracleProvider {
  private _dataSource: DataSource;
  private _config: OracleConnectionOptions;

  constructor() {
    this._config = {
      type: process.env.ORACLE_TYPE as any,
      host: process.env.ORACLE_HOST as string,
      port: process.env.ORACLE_PORT ? parseInt(process.env.ORACLE_PORT) : 1521,
      username: process.env.ORACLE_USER as string,
      password: process.env.ORACLE_PASSWORD as string,
      database: process.env.ORACLE_DB as string,
      sid: process.env.ORACLE_SID as string,
      synchronize: false, // Explicitly disable synchronization
      logging: false, // Disable logging unless needed
      entities: [], // No entities needed
      migrations: [], // No migrations
      subscribers: [], // No subscribers
    };
    this._dataSource = new DataSource(this.config);
  }

  async initialize() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      console.log("Oracle Data Source has been initialized!");
    }
  }

  async close() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log("Oracle Data Source has been closed!");
    }
  }

  async isConnected(): Promise<boolean> {
    return this.dataSource.isInitialized;
  }

  get dataSource() {
    return this._dataSource;
  }

  get config() {
    return this._config;
  }
}
