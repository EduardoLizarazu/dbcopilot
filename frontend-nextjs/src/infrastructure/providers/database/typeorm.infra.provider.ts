import { DataSource, DataSourceOptions } from "typeorm";

export class TypeOrmProvider {
  private _dataSource: DataSource;
  private _config: DataSourceOptions;

  constructor() {}

  get dataSource() {
    if (this._config) {
      this._dataSource = new DataSource(this.config);
      return this._dataSource;
    }
  }

  set dataSource(dataSource: DataSource) {
    this._dataSource = dataSource;
  }

  get config() {
    return this._config;
  }

  set config(config: DataSourceOptions) {
    this._config = config;
  }

  async createDataSource(config: {
    type: "mysql" | "postgres" | "mssql" | "oracle";
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    sid?: string;
  }) {
    this._config = {
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      ...(config.sid ? { sid: config.sid } : {}), // Include sid only if defined
      synchronize: false, // Explicitly disable synchronization
      logging: false, // Disable logging unless needed
      entities: [], // No entities needed
      migrations: [], // No migrations
      subscribers: [], // No subscribers
    };
    this._dataSource = new DataSource(this.config);
    await this._dataSource.initialize();
    console.log("Data Source has been initialized!");
    return this._dataSource;
  }

  async isConnected(): Promise<boolean> {
    return this._dataSource.isInitialized;
  }

  async initialize() {
    if (!this._dataSource) {
      this._dataSource = new DataSource(this.config);
    }
    await this._dataSource.initialize();
    console.log("Data Source has been initialized!");
  }

  async close() {
    if (this._dataSource) {
      await this._dataSource.destroy();
      this._dataSource = null;
      console.log("Data Source has been closed!");
    }
  }
}
