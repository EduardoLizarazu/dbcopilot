import { GetPermissionDataModel } from "../index.data.model";

export type CreatePermissionDataModel = Omit<GetPermissionDataModel, "id">;
