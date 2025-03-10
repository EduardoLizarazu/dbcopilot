import {
  CreatePermissionDataModel,
  GetPermissionDataModel,
  UpdatePermissionDataModel,
} from "@/data/model/index.data.model";
import { IPermissionRepository } from "./IPermission.data.repo";

export class PermissionRepository extends IPermissionRepository {
  permission: GetPermissionDataModel[];

  constructor() {
    super();
    this.permission = [
      { id: 1, name: "Create", description: "Create" },
      { id: 2, name: "Read", description: "Read" },
      { id: 3, name: "Update", description: "Update" },
      { id: 4, name: "Delete", description: "Delete" },
      { id: 5, name: "Create 2", description: "Create 2" },
      { id: 6, name: "Read 2", description: "Read 2" },
      { id: 7, name: "Update 2", description: "Update 2" },
      { id: 8, name: "Delete 2", description: "Delete 2" },
    ];
  }

  async createPermission(permission: CreatePermissionDataModel): Promise<void> {
    try {
      console.log("PermissionRepository.createPermission");
      this.permission.push({
        id: this.permission.length + 1,
        name: permission.name,
        description: permission.description,
      });
    } catch (error) {
      throw new Error("PermissionRepository.createPermission" + error);
    }
  }
  async getAllPermissions(): Promise<GetPermissionDataModel[]> {
    try {
      console.log("PermissionRepository.getAllPermissions");
      return this.permission;
    } catch (error) {
      throw new Error("PermissionRepository.getAllPermissions" + error);
    }
  }
  async getPermissionById(
    id: number
  ): Promise<GetPermissionDataModel | undefined> {
    try {
      console.log("PermissionRepository.getPermissionById");
      return this.permission.find((x) => x.id === id);
    } catch (error) {
      throw new Error("PermissionRepository.getPermissionById" + error);
    }
  }
  async updatePermission(permission: UpdatePermissionDataModel): Promise<void> {
    try {
      console.log("PermissionRepository.updatePermission");
      const index = this.permission.findIndex((x) => x.id === permission.id);
      this.permission[index] = {
        id: permission.id,
        name: permission.name,
        description: permission.description,
      };
    } catch (error) {
      throw new Error("PermissionRepository.updatePermission" + error);
    }
  }
  async deletePermission(id: number): Promise<void> {
    try {
      console.log("PermissionRepository.deletePermission");
      this.permission = this.permission.filter((x) => x.id !== id);
    } catch (error) {
      throw new Error("PermissionRepository.deletePermission" + error);
    }
  }
}
