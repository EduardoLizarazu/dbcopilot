import { GetUsersDataModel } from "./getUser.data.model";

export interface CreateUserDataModel extends Omit<GetUsersDataModel, 'id'> {}

