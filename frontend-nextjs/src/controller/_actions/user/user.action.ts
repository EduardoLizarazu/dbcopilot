"use server";

import { CreateUserDataModel, UpdateUserDataModel } from "@/data/model/index.data.model";
import { CreateUserService, GetUserByIdService, GetUsersService, UpdateUserService } from "@/di/index.di";


export const CreateUser = async (data: CreateUserDataModel) => {
  return await CreateUserService.execute(data);
}

export const GetUsers = async () => {
    return await GetUsersService.execute();
}

export const GetUserById = async (id:number) => {
    return await GetUserByIdService.execute(id);
}

export const UpdateUser = async (data: UpdateUserDataModel) => {
    return await UpdateUserService.execute(data);
}

export const DeleteUser = async (id: number) => {
    return await CreateUserService.execute(id);
}