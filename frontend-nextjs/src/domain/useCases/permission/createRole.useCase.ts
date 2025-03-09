import { RoleRepository } from "../repositories/RoleRepository";
import { Role } from "../entities/Role";

interface CreateRoleDTO {
  name: string;
  permissions: string[];
}

export class CreateRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute(data: CreateRoleDTO): Promise<Role> {
    const { name, permissions } = data;

    // Validate input data
    if (!name || !permissions || !Array.isArray(permissions)) {
      throw new Error("Invalid data");
    }

    // Create new role entity
    const role = new Role();
    role.name = name;
    role.permissions = permissions;

    // Save role to repository
    const createdRole = await this.roleRepository.save(role);

    return createdRole;
  }
}
