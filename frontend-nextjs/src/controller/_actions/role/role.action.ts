"use server";
import {
  CreateRoleDataModel,
  GetRolesDataModel,
  EditRoleDataModel,
} from "@/data/model/index.data.model";
import {
  CreateRoleService,
  GetRolesService,
  GetRoleByIdService,
  UpdateRoleService,
  RemoveRoleService,
} from "@/di/index.di";

export const CreateRole = async (data: CreateRoleDataModel) => {
  return await CreateRoleService.execute(data);
};

export const GetRoles = async (): Promise<GetRolesDataModel[]> => {
  return await GetRolesService.execute();
};

export const GetRoleById = async (
  id: number
): Promise<GetRolesDataModel | undefined> => {
  return await GetRoleByIdService.execute(id);
};

export const UpdateRole = async (data: EditRoleDataModel) => {
  return await UpdateRoleService.execute(data);
};

export const DeleteRole = async (id: number) => {
  return await RemoveRoleService.execute(id);
};
