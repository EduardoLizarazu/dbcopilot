// Typeorm provider class for Oracle database
import { DataSource } from "typeorm";

type OracleConnectionOptions = {
  type: "oracle";
  host: string;
  port: number;
  username: string;
  password: string;
  sid: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
  subscribers: string[];
};

export class OracleProvider {
  private _dataSource: DataSource;
  private _config: OracleConnectionOptions;

  constructor(config: OracleConnectionOptions) {
    this._config = config;
    this._dataSource = new DataSource(this.config);
  }

  async initialize() {
    if (!this._dataSource.isInitialized) {
      await this._dataSource.initialize();
      console.log("Oracle Data Source has been initialized!");
    }
  }

  async close() {
    if (this._dataSource.isInitialized) {
      await this._dataSource.destroy();
      console.log("Oracle Data Source has been closed!");
    }
  }

  async isConnected(): Promise<boolean> {
    return this._dataSource.isInitialized;
  }

  get dataSource() {
    return this._dataSource;
  }

  get config() {
    return this._config;
  }
}
