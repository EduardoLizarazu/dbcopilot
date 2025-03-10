"use server";
import { GetRolesDataModel } from "@/data/model/index.data.model";
import { CreateRoleService, GetRolesService } from "@/di/index.di";

export const CreateRole = async (data) => {
  return await CreateRoleService.execute(data);
};

export const GetRoles = async (): Promise<GetRolesDataModel[]> => {
  return await GetRolesService.execute();
};
