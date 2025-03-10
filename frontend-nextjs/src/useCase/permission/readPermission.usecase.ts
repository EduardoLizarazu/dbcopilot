import { PermissionRepository } from "@/data/repo/index.data.repo";

export class ReadPermissionUseCase {
  constructor(private permissionRepository: PermissionRepository) {}

  async execute() {
    return await this.permissionRepository.getAllPermissions();
  }
}
