import {
  CreatePermissionDataModel,
  GetPermissionDataModel,
} from "@/data/model/index.data.model";

export abstract class IPermissionRepository {
  abstract createPermission(permission: CreatePermissionDataModel): void;
  abstract getAllPermissions(): GetPermissionDataModel[];
}
