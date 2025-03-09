import { IRoleRepository } from "./IRole.repository";

export class RoleRepository implements IRoleRepository {
  private roles: RoleEntity[] = [];

  constructor() {
    // Initialize with some default roles if needed
    this.roles = [
      { id: 1, name: "Admin" },
      { id: 2, name: "User" },
      { id: 3, name: "Guest" },
    ];
  }

  getAllRoles(): RoleEntity[] {
    return this.roles;
  }

  getRoleById(id: number): RoleEntity | undefined {
    return this.roles.find((role) => role.id === id);
  }

  addRole(role: RoleEntity): void {
    this.roles.push(role);
  }

  updateRole(id: number, updatedRole: RoleEntity): boolean {
    const index = this.roles.findIndex((role) => role.id === id);
    if (index !== -1) {
      this.roles[index] = updatedRole;
      return true;
    }
    return false;
  }

  deleteRole(id: number): boolean {
    const index = this.roles.findIndex((role) => role.id === id);
    if (index !== -1) {
      this.roles.splice(index, 1);
      return true;
    }
    return false;
  }
}
