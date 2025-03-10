import { RoleRepository } from "@/data/repo/index.data.repo";
import { RoleEntity } from "@/domain/entities/index.domain.entity";
import { IdValueObject } from "@/domain/valueObject/index.domain.valueObject";

// src/useCase/role/create.usecase.ts

interface CreateRoleDTO {
  name: string;
}

export class CreateRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute(data: CreateRoleDTO): Promise<void> {
    const roleId = new IdValueObject(1);
    const role = new RoleEntity(roleId, data.name);

    const createDto = {
      name: role.name,
      permissions: [], // Add appropriate permissions here
    };

    await this.roleRepository.createRole(createDto);
  }
}
