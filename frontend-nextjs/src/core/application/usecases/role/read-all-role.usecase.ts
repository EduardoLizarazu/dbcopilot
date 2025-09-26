import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TRoleOutRequestDto } from "../../dtos/role.app.dto";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { RoleAppEnum } from "../../enums/role.app.enum";

export interface IReadAllRoleUseCase {
  execute(): Promise<TResponseDto<TRoleOutRequestDto[]>>;
}

export class ReadAllRoleUseCase implements IReadAllRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(): Promise<TResponseDto<TRoleOutRequestDto[]>> {
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
