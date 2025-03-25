import {
  CreatePromptDataModel,
  GetUsersDataModel,
  ReadConnectionDataModel,
} from "../index.data.model";

export interface ReqCreateChatDataModel {
  userId: Pick<GetUsersDataModel, "id">;
  connectionId: Pick<ReadConnectionDataModel, "id">;
  prompt: CreatePromptDataModel;
}
