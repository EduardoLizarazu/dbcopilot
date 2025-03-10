import { CreateUserDataModel, GetUsersDataModel, UpdateUserDataModel } from "@/data/model/index.data.model";

export abstract class IUserRepository {
  abstract createUser(user: CreateUserDataModel): Promise<void>;
  abstract getAllUsers(): Promise<GetUsersDataModel[]>;
  abstract getUserById(id: number): Promise<GetUsersDataModel | undefined>;
  abstract updateUser(user: UpdateUserDataModel): Promise<boolean>;
  abstract deleteUser(id: number): Promise<boolean>;
}