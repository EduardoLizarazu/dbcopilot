import { GetPermissionDataModel } from "../index.data.model";

export interface CreateRoleDataModel {
  name: string;
  permissions: GetPermissionDataModel[];
}
