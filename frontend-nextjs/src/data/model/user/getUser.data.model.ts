import { GetPermissionDataModel, GetRolesDataModel } from "../index.data.model";

export interface GetUsersDataModel {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    role: GetRolesDataModel[];
    directPermission: GetPermissionDataModel[];
}