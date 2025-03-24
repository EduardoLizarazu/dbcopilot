import { CreateChatDataModel } from "@/data/model/index.data.model";

export abstract class IChatRepo {
  abstract createChat(data: CreateChatDataModel): Promise<ChatDataModel>;
}