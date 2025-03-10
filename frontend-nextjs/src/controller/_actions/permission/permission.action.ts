"use server";

import {
  GetPermissionDataModel,
  CreatePermissionDataModel,
  UpdatePermissionDataModel,
} from "@/data/model/index.data.model";
import {
  GetPermissionsService,
  CreatePermissionService,
  GetPermissionByIdService,
  UpdatePermissionService,
  DeletePermissionByIdService,
} from "@/di/index.di";

export const CreatePermission = async (
  data: CreatePermissionDataModel
): Promise<void> => {
  return await CreatePermissionService.execute(data);
};

export const GetPermissions = async (): Promise<GetPermissionDataModel[]> => {
  return await GetPermissionsService.execute();
};

export const GetPermissionById = async (
  id: number
): Promise<GetPermissionDataModel | undefined> => {
  return await GetPermissionByIdService.execute(id);
};

export const UpdatePermission = async (
  date: UpdatePermissionDataModel
): Promise<void> => {
  return await UpdatePermissionService.execute(date);
};

export const DeletePermissionById = async (id: number): Promise<void> => {
  return await DeletePermissionByIdService.execute(id);
};
