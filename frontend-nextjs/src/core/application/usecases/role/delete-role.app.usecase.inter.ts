import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { RoleAppEnum } from "../../enums/role.app.enum";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IDeleteRoleAppUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteRoleUseCaseRepo implements IDeleteRoleAppUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      this.logger.info("[DeleteRoleUseCase]: Executing with id:", id);
      // Check if role exists
      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole) {
        this.logger.warn("[DeleteRoleUseCase]: Role not found with id:", id);
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }

      await this.roleRepository.delete(id);
      this.logger.info("[DeleteRoleUseCase]: Role deleted with id:", id);
      return {
        success: true,
        message: RoleAppEnum.roleDeletedSuccessfully,
        data: null,
      };
    } catch (error) {
      this.logger.error("[DeleteRoleUseCase]: Unexpected error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}
