import {
  CreateInsightDataModel,
  ReadInsightDataModel,
  UpdateInsightDataModel,
} from "@/data/model/index.data.model";

export abstract class IInsightRepo {
  abstract getInsight(): Promise<ReadInsightDataModel[]>;
  abstract getInsightById(id: number): Promise<ReadInsightDataModel>;
  abstract createInsight(data: CreateInsightDataModel): Promise<void>;
  abstract updateInsight(data: UpdateInsightDataModel): Promise<void>;
  abstract deleteInsight(id: number): Promise<void>;
}
