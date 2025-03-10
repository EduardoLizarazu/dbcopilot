import { GetPermissionDataModel } from "../index.data.model";

export interface GetRolesDataModel {
  id: string;
  name: string;
  permissions: GetPermissionDataModel[];
}
