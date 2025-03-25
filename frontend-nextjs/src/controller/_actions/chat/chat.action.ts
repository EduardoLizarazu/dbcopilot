"use server";

import { CreateChatService } from "@/di/index.di";
import {
  CreateChatUseCaseInput,
  CreateChatUseCaseOutput,
} from "@/useCase/index.usecase";

export const CreateChatAction = async (
  data: CreateChatUseCaseInput
): Promise<CreateChatUseCaseOutput> => {
  return await CreateChatService.execute(data);
};
