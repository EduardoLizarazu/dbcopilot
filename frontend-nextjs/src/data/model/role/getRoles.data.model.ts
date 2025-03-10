import { GetPermissionDataModel } from "../index.data.model";

export interface GetRolesDataModel {
  id: number;
  name: string;
  permissions: GetPermissionDataModel[];
}
