"use server";
import {
  CreateUserService,
  DeleteUserService,
  GetUserByIdService,
  GetUsersService,
  UpdateUserService,
} from "@/di/index.di";
import {
  CreateUserUseCaseInput,
  ReadUserUseCaseOutput,
  UpdateUserUseCaseInput,
} from "@/useCase/index.usecase";

export const CreateUser = async (data: CreateUserUseCaseInput) => {
  return await CreateUserService.execute(data);
};

export const GetUsers = async (): Promise<ReadUserUseCaseOutput[]> => {
  return await GetUsersService.execute();
};

export const GetUserById = async (
  id: number
): Promise<ReadUserUseCaseOutput> => {
  return await GetUserByIdService.execute(id);
};

export const UpdateUser = async (
  data: UpdateUserUseCaseInput
): Promise<void> => {
  await UpdateUserService.execute(data);
};

export const DeleteUser = async (id: number): Promise<void> => {
  return await DeleteUserService.execute(id);
};
