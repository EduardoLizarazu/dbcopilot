import {
  ReqCreateChatDataModel,
  ResCreateChatDataModel,
} from "@/data/model/index.data.model";
import { ChatRepo } from "@/data/repo/index.data.repo";

export type CreateChatUseCaseInput = ReqCreateChatDataModel;
export type CreateChatUseCaseOutput = ResCreateChatDataModel;
export class CreateChatUseCase {
  constructor(private readonly chatRepository: ChatRepo) {}

  async execute(
    data: CreateChatUseCaseInput
  ): Promise<CreateChatUseCaseOutput> {
    return await this.chatRepository.createChat(data);
  }
}
