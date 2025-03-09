import { RoleRepository } from "@data/repositories/index";
import { RoleEntity } from "@domain/entities/index";
import { IdValueObject } from "@domain/valueObject/index";

// src/useCase/role/create.usecase.ts

interface CreateRoleDTO {
  id: number;
  name: string;
}

export class CreateRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute(data: CreateRoleDTO): Promise<void> {
    const roleId = new IdValueObject(data.id);
    const role = new RoleEntity(roleId, data.name);

    await this.roleRepository.addRole(role);
  }
}
