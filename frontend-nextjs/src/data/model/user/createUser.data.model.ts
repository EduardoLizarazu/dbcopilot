import { GetUsersDataModel } from "./getUser.data.model";

export type CreateUserDataModel = Omit<GetUsersDataModel, "id">;
