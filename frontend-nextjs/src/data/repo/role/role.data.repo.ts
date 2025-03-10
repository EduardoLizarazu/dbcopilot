import {
  CreateRoleDataModel,
  GetRolesDataModel,
} from "@/data/model/index.data.model";
import { IRoleRepository } from "./IRole.data.repo";

export class RoleRepository extends IRoleRepository {
  role: GetRolesDataModel[];

  constructor() {
    super();
    this.role = [
      {
        id: 1,
        name: "Admin",
        permissions: [
          { id: 1, name: "Create", description: "Create" },
          { id: 2, name: "Read", description: "Read" },
          { id: 3, name: "Update", description: "Update" },
          { id: 4, name: "Delete", description: "Delete" },
        ],
      },
      {
        id: 2,
        name: "User",
        permissions: [
          { id: 1, name: "Create", description: "Create" },
          { id: 2, name: "Read", description: "Read" },
        ],
      },
    ];
  }

  createRole(role: CreateRoleDataModel): void {
    try {
      console.log("RoleRepository.createRole");
      this.role.push({
        id: this.role.length + 1,
        name: role.name,
        permissions: role.permissions,
      });
    } catch (error) {
      throw new Error("RoleRepository.createRole" + error);
    }
  }
  getAllRoles(): GetRolesDataModel[] {
    try {
      console.log("RoleRepository.getAllRoles");
      return this.role;
    } catch (error) {
      throw new Error("RoleRepository.getAllRoles" + error);
    }
  }
}
