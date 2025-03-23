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
      { id: 1, name: "Connection 1", description: "Connection 1" },
      { id: 2, name: "Connection 2", description: "Connection 2" },
      { id: 3, name: "Connection 3", description: "Connection 3" },
      { id: 4, name: "Connection 4", description: "Connection 4" },
      { id: 5, name: "Connection 5", description: "Connection 5" },
      { id: 6, name: "Connection 6", description: "Connection 6" },
      { id: 7, name: "Connection 7", description: "Connection 7" },
      { id: 8, name: "Connection 8", description: "Connection 8" },
    ];
  }

  async createConnection(connection: CreateConnectionDataModel): Promise<void> {
    try {
      console.log("ConnectionRepository.createConnection");
      this.connection.push({
        id: this.connection.length + 1,
        name: connection.name,
        description: connection.description,
      });
    } catch (error) {
      throw new Error("ConnectionRepository.createConnection" + error);
    }
  }
  async getAllConnections(): Promise<ReadConnectionDataModel[]> {
    try {
      console.log("ConnectionRepository.getAllConnections");
      return this.connection;
    } catch (error) {
      throw new Error("ConnectionRepository.getAllConnections" + error);
    }
  }
  async getConnectionById(
    id: number
  ): Promise<ReadConnectionDataModel | undefined> {
    try {
      console.log("ConnectionRepository.getConnectionById");
      return this.connection.find((x) => x.id === id);
    } catch (error) {
      throw new Error("ConnectionRepository.getConnectionById" + error);
    }
  }
  async updateConnection(connection: UpdateConnectionDataModel): Promise<void> {
    try {
      console.log("ConnectionRepository.updateConnection");
      const index = this.connection.findIndex((x) => x.id === connection.id);
      this.connection[index] = {
        id: connection.id,
        name: connection.name,
        description: connection.description,
      };
    } catch (error) {
      throw new Error("ConnectionRepository.updateConnection" + error);
    }
  }
  async deleteConnection(id: number): Promise<void> {
    try {
      console.log("ConnectionRepository.deleteConnection");
      this.connection = this.connection.filter((x) => x.id !== id);
    } catch (error) {
      throw new Error("ConnectionRepository.deleteConnection" + error);
    }
  }
}
