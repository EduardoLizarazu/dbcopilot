import {
  ReadResultDataModel,
  CreateResultDataModel,
  UpdateResultDataModel,
} from "@/data/model/index.data.model";
import { IResultDataRepo } from "./iResult.data.repo";

export class ResultRepo extends IResultDataRepo {
  result: ReadResultDataModel[];

  constructor() {
    super();
    this.result = [
      {
        id: 1,
        data: "Result 1",
      },
      {
        id: 2,
        data: "Result 2",
      },
    ];
  }

  getResults(): Promise<ReadResultDataModel[]> {
    throw new Error("Method not implemented.");
  }
  getResultById(id: string): Promise<ReadResultDataModel> {
    throw new Error("Method not implemented.");
  }
  createResult(result: CreateResultDataModel): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateResult(result: UpdateResultDataModel): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteResult(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
