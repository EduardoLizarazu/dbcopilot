import { GetPermissionDataModel, GetRolesDataModel } from "../index.data.model";

export interface GetRolesForUserDataModel extends GetRolesDataModel {
  permissions: (GetPermissionDataModel & { isActive: boolean })[];
}
