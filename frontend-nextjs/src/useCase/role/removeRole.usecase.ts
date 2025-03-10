import { RoleRepository } from "@/data/repo/index.data.repo";

export class RemoveRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute(data: number): Promise<void> {
    await this.roleRepository.deleteRole(data);
  }
}
