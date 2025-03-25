import {
  ReqCreateChatDataModel,
  ResCreateChatDataModel,
} from "@/data/model/index.data.model";
import { IChatRepo } from "./iChat.data.repo";

export class ChatRepo extends IChatRepo {
  chat: ResCreateChatDataModel;

  constructor() {
    super();
    this.chat = {
      userId: {
        id: 1,
      },
      connectionId: {
        id: 1,
      },
      prompt: {
        id: 1,
        text: "text",
        userId: 0,
      },
      response: {
        result: {
          id: 1,
          text: "text",
          userId: 0,
        },
        insight: {
          id: 1,
          originalInsight: "text",
          correctedInsight: "",
          isCorrected: false,
        },
        query: {
          id: 1,
          originalQuery: "text",
          correctedQuery: "",
          isCorrected: false,
        },
      },
    };
  }

  async createChat(
    data: ReqCreateChatDataModel
  ): Promise<ResCreateChatDataModel> {
    return this.chat;
  }
}
