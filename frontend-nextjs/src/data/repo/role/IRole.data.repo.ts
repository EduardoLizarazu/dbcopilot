import { CreateRoleDataModel } from "@/data/model/index.data.model";

export abstract class IRoleRepository {
  abstract createRole(role: CreateRoleDataModel): void;
  // getAllRoles(): RoleEntity[];
  // getRoleById(id: number): RoleEntity | undefined;
  // updateRole(id: number, updatedRole: RoleEntity): boolean;
  // deleteRole(id: number): boolean;
}
