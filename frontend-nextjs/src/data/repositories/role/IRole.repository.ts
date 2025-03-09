import { RoleEntity } from "@domain/entities/index";

export interface IRoleRepository {
  getAllRoles(): RoleEntity[];
  getRoleById(id: number): RoleEntity | undefined;
  addRole(role: RoleEntity): void;
  updateRole(id: number, updatedRole: RoleEntity): boolean;
  deleteRole(id: number): boolean;
}
