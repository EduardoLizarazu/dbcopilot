import { RoleRepository } from "@/data/repo/index.data.repo";
import {
  PermissionEntity,
  RoleEntity,
} from "@/domain/entities/index.domain.entity";
import { IdValueObject } from "@/domain/valueObject/id.domain.valueObject";

interface EditRoleDTO {
  id: number;
  name: string;
  permissions: { id: number; name: string; description: string }[];
}

export class EditRoleUseCase {
  constructor(private roleRepository: RoleRepository) {}

  async execute(data: EditRoleDTO): Promise<void> {
    const roleId = new IdValueObject(data.id);
    const role = new RoleEntity(roleId, data.name);
    const permissions: PermissionEntity[] = [];
    data.permissions.forEach((perm) => {
      const permissionId = new IdValueObject(perm.id);
      const permission = new PermissionEntity(
        permissionId,
        perm.name,
        perm.description
      );
      permissions.push(permission);
    });

    const editDTO: EditRoleDTO = {
      id: role.id,
      name: role.name,
      permissions: permissions.map((perm) => {
        return {
          id: perm.id,
          name: perm.name,
          description: perm.description,
        };
      }),
    };

    await this.roleRepository.updateRole(editDTO);
  }
}
