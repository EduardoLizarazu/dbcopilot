import { PermissionRepository } from "@/data/repo/index.data.repo";

export class DeletePermissionByIdUseCase {
  constructor(private permissionRepository: PermissionRepository) {}

  async execute(id: number): Promise<void> {
    await this.permissionRepository.deletePermission(id);
  }
}
