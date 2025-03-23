"use server";

import { ReadConnectionsService } from "@/di/index.di";
import { ReadConnectionUseCaseOutput } from "@useCases/index.usecase";

export const GetConnectionAction = async (): Promise<
  ReadConnectionUseCaseOutput[]
> => {
  return await ReadConnectionsService.execute();
};
