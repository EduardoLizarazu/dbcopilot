import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { IReadByIdRoleAppUseCase } from "../../interfaces/role/read-role-by-id.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";

export class ReadRoleByIdUseCase implements IReadByIdRoleAppUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<TResponseDto> {
    try {
      const role = await this.roleRepository.findById(id);
      return {
        success: true,
        message: !role
          ? RoleAppEnum.roleFoundSuccessfully
          : RoleAppEnum.roleNotFound,
        data: role,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}
