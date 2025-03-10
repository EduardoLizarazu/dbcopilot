import { GetPermissionDataModel } from "@/data/model/index.data.model";
import { PermissionRepository } from "@/data/repo/index.data.repo";

export class ReadPermissionByIdUseCase {
  constructor(private permissionRepository: PermissionRepository) {}

  async execute(
    permissionId: number
  ): Promise<GetPermissionDataModel | undefined> {
    return await this.permissionRepository.getPermissionById(permissionId);
  }
}
