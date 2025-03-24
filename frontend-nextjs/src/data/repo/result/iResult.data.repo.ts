import {
  CreateResultDataModel,
  ReadResultDataModel,
  UpdateResultDataModel,
} from "@/data/model/index.data.model";

export abstract class IResultDataRepo {
  abstract getResults(): Promise<ReadResultDataModel[]>;
  abstract getResultById(id: string): Promise<ReadResultDataModel>;
  abstract createResult(result: CreateResultDataModel): Promise<void>;
  abstract updateResult(result: UpdateResultDataModel): Promise<void>;
  abstract deleteResult(id: string): Promise<void>;
}
