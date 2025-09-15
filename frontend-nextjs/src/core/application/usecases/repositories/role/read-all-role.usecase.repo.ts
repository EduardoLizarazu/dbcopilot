import { RoleEntity } from "@/core/domain/entities/role.domain.entity";
import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { IReadAllRoleAppUseCase } from "../../interfaces/role/read-all-role.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";

export class ReadAllRoleUseCase implements IReadAllRoleAppUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(): Promise<TResponseDto> {
    try {
      const roles = await this.roleRepository.findAll();
      return {
        success: true,
        data: roles,
        message:
          roles.length > 0
            ? RoleAppEnum.roleFoundSuccessfully
            : RoleAppEnum.roleNotFound,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
