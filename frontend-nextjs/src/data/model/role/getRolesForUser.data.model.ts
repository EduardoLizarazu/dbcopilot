import { GetPermissionDataModel, GetRolesDataModel } from "../index.data.model";

export interface GetRolesForUserDataModel
  extends Omit<GetRolesDataModel, "permissions"> {
  permissions: (GetPermissionDataModel & { isActive: boolean })[];
}
