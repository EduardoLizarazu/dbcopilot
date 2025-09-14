import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { IDeleteRoleAppUseCase } from "../../interfaces/role/delete-role.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";

export class DeleteRoleUseCaseRepo implements IDeleteRoleAppUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<TResponseDto> {
    try {
      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole) {
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }

      await this.roleRepository.delete(id);

      return {
        success: true,
        message: RoleAppEnum.roleDeletedSuccessfully,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}
