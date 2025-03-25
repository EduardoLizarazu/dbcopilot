import {
  ReadInsightDataModel,
  ReadPromptDataModel,
  ReadQueryDataModel,
  ReqCreateChatDataModel,
} from "../index.data.model";

export interface ResCreateChatDataModel
  extends Omit<ReqCreateChatDataModel, "prompt"> {
  prompt: ReadPromptDataModel;
  response: {
    result: ReadPromptDataModel;
    insight: ReadInsightDataModel;
    query: ReadQueryDataModel;
  };
}
