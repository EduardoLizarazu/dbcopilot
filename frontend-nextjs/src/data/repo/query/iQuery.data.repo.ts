import {
  CreateQueryDataModel,
  ReadQueryDataModel,
  UpdateQueryDataModel,
} from "@/data/model/index.data.model";

export abstract class IQueryDataRepo {
  abstract getQueries(): Promise<ReadQueryDataModel[]>;
  abstract getQueryById(id: string): Promise<ReadQueryDataModel>;
  abstract createQuery(query: CreateQueryDataModel): Promise<void>;
  abstract updateQuery(query: UpdateQueryDataModel): Promise<void>;
  abstract deleteQuery(id: string): Promise<void>;
}
