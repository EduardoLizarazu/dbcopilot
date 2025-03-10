import { PermissionRepository } from "@/data/repo/index.data.repo";
import { PermissionEntity } from "@/domain/entities/permission.domain.entity";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

interface CreatePermissionDTO {
  name: string;
  description: string;
}

export class CreatePermissionUseCase {
  constructor(private permissionRepository: PermissionRepository) {}

  async execute(data: CreatePermissionDTO): Promise<void> {
    const permissionId = new IdValueObject(1);
    const permission = new PermissionEntity(
      permissionId,
      data.name,
      data.description
    );

    const createDto = {
      name: permission.name,
      description: permission.description,
    };

    await this.permissionRepository.createPermission(createDto);
  }
}
