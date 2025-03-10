import { RoleRepository } from "@data/repo/index.data.repo";

export class ReadRolesUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute() {
    return await this.roleRepository.getAllRoles();
  }
}
