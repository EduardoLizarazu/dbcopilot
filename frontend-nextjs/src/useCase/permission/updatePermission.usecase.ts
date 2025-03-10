import { PermissionRepository } from "@/data/repo/index.data.repo";
import { PermissionEntity } from "@/domain/entities/index.domain.entity";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

interface UpdatePermissionDTO {
  id: number;
  name: string;
  description: string;
}
export class UpdatePermissionUseCase {
  constructor(private permissionRepository: PermissionRepository) {}

  async execute(data: UpdatePermissionDTO): Promise<void> {
    const permission = new PermissionEntity(
      new IdValueObject(data.id),
      data.name,
      data.description
    );

    const updatePermissionDTO = {
      id: permission.id,
      name: permission.name,
      description: permission.description,
    };

    await this.permissionRepository.updatePermission(updatePermissionDTO);
  }
}
