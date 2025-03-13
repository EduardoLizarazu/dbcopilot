import { GetRolesDataModel } from "../index.data.model";

export type CreateRoleDataModel = Omit<GetRolesDataModel, "id">;
