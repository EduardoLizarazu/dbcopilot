"use server";

import {
  GetPermissionDataModel,
  CreatePermissionDataModel,
} from "@/data/model/index.data.model";
import { GetPermissionsService, CreatePermissionService } from "@/di/index.di";

export const GetPermissions = async (): Promise<GetPermissionDataModel[]> => {
  return await GetPermissionsService.execute();
};

export const CreatePermission = async (
  data: CreatePermissionDataModel
): Promise<void> => {
  return await CreatePermissionService.execute(data);
};
