import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { RoleAppEnum } from "../../enums/role.app.enum";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";

export interface IDeleteRoleUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteRoleUseCaseRepo implements IDeleteRoleUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly roleRepository: IRoleRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      // 1. Validate ID
      this.logger.info("[DeleteRoleUseCase]: Executing with id:", id);
      if (!id) {
        this.logger.error("[DeleteRoleUseCase]: ID is required");
        return {
          success: false,
          message: "ID is required",
          data: null,
        };
      }

      // 2. Check if role exists
      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole) {
        this.logger.warn("[DeleteRoleUseCase]: Role not found with id:", id);
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }

      // 3. Check if any user is assigned to this role
      const usersWithRole = await this.userRepo.findByRoleId(id);
      if (usersWithRole && usersWithRole.length > 0) {
        this.logger.warn(
          "[DeleteRoleUseCase]: Users are still assigned to this role:",
          usersWithRole
        );
        return {
          success: false,
          message:
            "[DeleteRoleUseCase]: Cannot delete role; users are still assigned to this role.",
          data: null,
        };
      }
      // 4. Delete role
      await this.roleRepository.delete(id);
      this.logger.info("[DeleteRoleUseCase]: Role deleted with id:", id);

      // 5. Return success response
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
