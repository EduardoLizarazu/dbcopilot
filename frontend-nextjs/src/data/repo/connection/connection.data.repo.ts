import {
  CreateConnectionDataModel,
  ReadConnectionDataModel,
  UpdateConnectionDataModel,
} from "@/data/model/index.data.model";
import { IConnectionRepository } from "./IConnection.data.repo";

export class ConnectionRepository extends IConnectionRepository {
  connection: ReadConnectionDataModel[];

  constructor() {
    super();
    this.connection = [
      {
        connectionName: "Connection 1",
        description: "Connection 1 description",
        databaseType: "PostgreSQL",
        host: "localhost",
        port: 5432,
        databaseName: "postgres",
        username: "postgres",
        password: "password",
        id: 0,
      },
      {
        connectionName: "Connection 2",
        description: "Connection 2 description",
        databaseType: "MySQL",
        host: "localhost",
        port: 3306,
        databaseName: "mysql",
        username: "mysql",
        password: "password",
        id: 1,
      },
      {
        connectionName: "Connection 3",
        description: "Connection 3 description",
        databaseType: "SQLite",
        host: "localhost",
        port: 0,
        databaseName: "sqlite",
        username: "sqlite",
        password: "password",
        id: 2,
      },
    ];
  }

  async createConnection(data: CreateConnectionDataModel): Promise<void> {
    await this.connection.push({ ...data, id: this.connection.length });
  }

  async getAllConnections(): Promise<ReadConnectionDataModel[]> {
    return this.connection;
  }

  async getConnectionById(
    id: number
  ): Promise<ReadConnectionDataModel | undefined> {
    return await Promise.resolve(this.connection.find((c) => c.id === id));
  }
  async updateConnection(connection: UpdateConnectionDataModel): Promise<void> {
    this.connection = this.connection.map((c) =>
      c.id === connection.id ? connection : c
    );
  }
  async deleteConnection(id: number): Promise<void> {
    this.connection = this.connection.filter((c) => c.id !== id);
  }
}
