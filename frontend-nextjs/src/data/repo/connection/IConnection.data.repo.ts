import {
  CreateConnectionDataModel,
  ReadConnectionDataModel,
  UpdateConnectionDataModel,
} from "@/data/model/index.data.model";

export abstract class IConnectionRepository {
  abstract createConnection(
    connection: CreateConnectionDataModel
  ): Promise<void>;
  abstract getAllConnections(): Promise<ReadConnectionDataModel[]>;
  abstract getConnectionById(
    id: number
  ): Promise<ReadConnectionDataModel | undefined>;
  abstract updateConnection(
    connection: UpdateConnectionDataModel
  ): Promise<void>;
  abstract deleteConnection(id: number): Promise<void>;
}
