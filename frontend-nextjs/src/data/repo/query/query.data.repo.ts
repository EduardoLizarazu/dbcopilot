import {
  ReadQueryDataModel,
  CreateQueryDataModel,
  UpdateQueryDataModel,
} from "@/data/model/index.data.model";
import { IQueryDataRepo } from "./iQuery.data.repo";

export class QueryRepo extends IQueryDataRepo {
  query: ReadQueryDataModel[];

  constructor() {
    super();
    this.query = [
      {
        id: "1",
        originalQuery: "Query 1",
        correctedQuery: "Description 1",
        isCorrected: true,
      },
      {
        id: "2",
        originalQuery: "Query 2",
        correctedQuery: "",
        isCorrected: false,
      },
    ];
  }

  async getQueries(): Promise<ReadQueryDataModel[]> {
    throw new Error("Method not implemented.");
  }
  async getQueryById(id: string): Promise<ReadQueryDataModel> {
    throw new Error("Method not implemented.");
  }
  async createQuery(query: CreateQueryDataModel): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async updateQuery(query: UpdateQueryDataModel): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async deleteQuery(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
