import {
  CreatePermissionDataModel,
  GetPermissionDataModel,
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

  createPermission(permission: CreatePermissionDataModel): void {
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
  getAllPermissions(): GetPermissionDataModel[] {
    try {
      console.log("PermissionRepository.getAllPermissions");
      return this.permission;
    } catch (error) {
      throw new Error("PermissionRepository.getAllPermissions" + error);
    }
  }
}
