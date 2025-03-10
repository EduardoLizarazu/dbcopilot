import {
  CreateRoleDataModel,
  EditRoleDataModel,
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

  async createRole(role: CreateRoleDataModel): Promise<void> {
    try {
      console.log("RoleRepository.createRole", role);
      this.role.push({
        id: this.role.length + 1,
        name: role.name,
        permissions: role.permissions,
      });
    } catch (error) {
      throw new Error("RoleRepository.createRole" + error);
    }
  }
  async getAllRoles(): Promise<GetRolesDataModel[]> {
    try {
      console.log("RoleRepository.getAllRoles");
      return this.role;
    } catch (error) {
      throw new Error("RoleRepository.getAllRoles" + error);
    }
  }
  async getRoleById(id: number): Promise<GetRolesDataModel | undefined> {
    try {
      console.log("RoleRepository.getRoleById", id);
      return this.role.find((role) => role.id === id);
    } catch (error) {
      throw new Error("RoleRepository.getRoleById" + error);
    }
  }
  async updateRole(role: EditRoleDataModel): Promise<boolean> {
    try {
      console.log("RoleRepository.updateRole", role);
      const index = this.role.findIndex((r) => r.id === role.id);
      this.role[index] = role;
      return true;
    } catch (error) {
      throw new Error("RoleRepository.updateRole" + error);
    }
  }
  async deleteRole(id: number): Promise<boolean> {
    try {
      console.log("RoleRepository.deleteRole", id);
      this.role = this.role.filter((role) => role.id !== id);
      return true;
    } catch (error) {
      throw new Error("RoleRepository.deleteRole" + error);
    }
  }
}
