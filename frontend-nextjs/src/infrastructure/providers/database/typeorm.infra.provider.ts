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
    // Build extra options conditionally: include ssl only when not connecting to localhost
    const extraBase: any = {
      encrypt: true,
      trustServerCertificate: false,
    };

    const extra =
      config.host && config.host.toLowerCase() !== "localhost"
        ? {
            ...extraBase,
            rejectUnauthorized: false,
            ssl: { rejectUnauthorized: false },
          }
        : extraBase;

    this._config = {
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      ...(config.sid ? { sid: config.sid } : {}), // Include sid only if defined
      synchronize: false, // Explicitly disable synchronization
      logging: true, // Disable logging unless needed
      entities: [], // No entities needed
      migrations: [], // No migrations
      subscribers: [], // No subscribers
      extra,
    };
    return await new DataSource(this.config);
  }

  async isConnected(): Promise<boolean> {
    return this.dataSource.isInitialized;
  }

  async initialize() {
    if (!this.dataSource) {
      this.dataSource = new DataSource(this.config);
    }
    await this.dataSource.initialize();
    console.log("Data Source has been initialized!");
  }

  async close() {
    if (this.dataSource) {
      await this.dataSource.destroy();
      this.dataSource = null;
      console.log("Data Source has been closed!");
    }
  }
}
