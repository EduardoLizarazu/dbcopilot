import {
  GetPermissionDataModel,
  GetRolesForUserDataModel,
} from "../index.data.model";

export interface GetUsersDataModel {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  username: string;
  email: string;
  password: string;
  roles: GetRolesForUserDataModel[];
  directPermissions: GetPermissionDataModel[];
}
