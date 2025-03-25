import {
  ReqCreateChatDataModel,
  ResCreateChatDataModel,
} from "@/data/model/index.data.model";

export abstract class IChatRepo {
  abstract createChat(
    data: ReqCreateChatDataModel
  ): Promise<ResCreateChatDataModel>;
}
