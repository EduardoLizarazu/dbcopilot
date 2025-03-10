import {
  CreatePermissionDataModel,
  GetPermissionDataModel,
  UpdatePermissionDataModel,
} from "@/data/model/index.data.model";

export abstract class IPermissionRepository {
  abstract createPermission(
    permission: CreatePermissionDataModel
  ): Promise<void>;
  abstract getAllPermissions(): Promise<GetPermissionDataModel[]>;
  abstract getPermissionById(
    id: number
  ): Promise<GetPermissionDataModel | undefined>;
  abstract updatePermission(
    permission: UpdatePermissionDataModel
  ): Promise<void>;
  abstract deletePermission(id: number): Promise<void>;
}
