import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { IReadByNameAppUseCase } from "../../interfaces/role/read-role-by-name.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";

export class ReadByNameRoleUseCase implements IReadByNameAppUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(name: string): Promise<TResponseDto> {
    try {
      const role = await this.roleRepository.findByName(name);
      return {
        success: true,
        data: role,
        message: role
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
