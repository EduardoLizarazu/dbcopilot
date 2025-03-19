import {
  CreateUserDataModel,
  GetUsersDataModel,
  UpdateUserDataModel,
} from "@/data/model/index.data.model";
import { IUserRepository } from "./iUser.data.repo";

export class UserRepository extends IUserRepository {
  user: GetUsersDataModel[];

  constructor() {
    super();
    this.user = [
      {
        id: 1,
        firstName: "Snow Jon",
        lastName: "Doe",
        email: "ex@gmail.com",
        phone: "689-555-5555",
        password: "Passw0rd",
        roles: [
          {
            id: 1,
            name: "admin",
            permissions: [
              { id: 1, name: "Create", description: "Create", isActive: true },
              { id: 2, name: "Read", description: "Read", isActive: false },
              { id: 3, name: "Update", description: "Update", isActive: false },
              { id: 4, name: "Delete", description: "Delete", isActive: false },
            ],
          },
          {
            id: 2,
            name: "finance",
            permissions: [
              {
                id: 5,
                name: "Create 2",
                description: "Create 2",
                isActive: true,
              },
              { id: 6, name: "Read 2", description: "Read 2", isActive: true },
              {
                id: 7,
                name: "Update 2",
                description: "Update 2",
                isActive: true,
              },
            ],
          },
        ],
        directPermissions: [
          { id: 8, name: "Delete 2", description: "Delete 2" },
        ],
        username: "snowjon",
      },
      {
        id: 2,
        firstName: "Jane",
        lastName: "Doe",
        email: "ex@gmail.com",
        phone: "689-555-5555",
        password: "Passw0rd",
        roles: [
          {
            id: 1,
            name: "admin",
            permissions: [
              {
                id: 1,
                name: "read users",
                description: "read users",
                isActive: true,
              },
              {
                id: 3,
                name: "delete users",
                description: "delete users",
                isActive: true,
              },
            ],
          },
          {
            id: 2,
            name: "finance",
            permissions: [
              {
                id: 2,
                name: "write users",
                description: "write users",
                isActive: true,
              },
            ],
          },
        ],
        directPermissions: [
          { id: 2, name: "write users", description: "write users" },
        ],
        username: "jane",
      },
    ];
  }

  async createUser(user: CreateUserDataModel): Promise<void> {
    try {
      console.log("UserRepo.Create: ", user);
      this.user.push({
        id: this.user.length + 1,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        password: user.password,
        roles: user.roles,
        directPermissions: user.directPermissions,
        username: user.username,
      });
    } catch (error) {
      throw new Error("UserRepo.Create: " + error);
    }
  }
  async getAllUsers(): Promise<GetUsersDataModel[]> {
    try {
      console.log("UserRepo.getAllUsers");
      return this.user;
    } catch (error) {
      throw new Error("UserRepo.getAllUsers: " + error);
    }
  }
  async getUserById(id: number): Promise<GetUsersDataModel | undefined> {
    try {
      console.log("UserRepo.getUserById: ", id);
      return this.user.find((user) => user.id === id);
    } catch (error) {
      throw new Error("UserRepo.getUserById: " + error);
    }
  }
  async updateUser(user: UpdateUserDataModel): Promise<boolean> {
    try {
      console.log("UserRepo.updateUser: ", user);
      const index = this.user.findIndex((u) => u.id === user.id);
      this.user[index] = user;
      return true;
    } catch (error) {
      throw new Error("UserRepo.updateUser: " + error);
    }
  }
  async deleteUser(id: number): Promise<boolean> {
    try {
      console.log("UserRepo.deleteUser: ", id);
      this.user = this.user.filter((user) => user.id !== id);
      return true;
    } catch (error) {
      throw new Error("UserRepo.deleteUser: " + error);
    }
  }
}
