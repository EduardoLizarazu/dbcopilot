import {
  CreateInsightDataModel,
  ReadInsightDataModel,
  UpdateInsightDataModel,
} from "@/data/model/index.data.model";
import { IInsightRepo } from "./iInsight.data.model";

export class InsightRepo extends IInsightRepo {
  insight: ReadInsightDataModel[];

  constructor() {
    super();
    this.insight = [
      {
        id: 1,
        originalInsight: "Original Insight 1",
        correctedInsight: "Corrected Insight 1",
        isCorrected: true,
      },
      {
        id: 2,
        originalInsight: "Original Insight 2",
        correctedInsight: "Corrected Insight 2",
        isCorrected: true,
      },
    ];
  }

  getInsight(): Promise<ReadInsightDataModel[]> {
    throw new Error("Method not implemented.");
  }
  getInsightById(id: number): Promise<ReadInsightDataModel> {
    throw new Error("Method not implemented.");
  }
  createInsight(data: CreateInsightDataModel): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateInsight(data: UpdateInsightDataModel): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteInsight(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
