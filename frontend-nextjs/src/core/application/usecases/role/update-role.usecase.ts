import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import {
  TRoleOutRequestDto,
  TUpdateRoleDto,
  updateRoleSchema,
} from "@/core/application/dtos/role.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { RoleAppEnum } from "../../enums/role.app.enum";
import { RoleEntity } from "@/core/domain/entities/role.domain.entity";

export interface IUpdateRoleUseCase {
  execute(
    id: string,
    data: TUpdateRoleDto
  ): Promise<TResponseDto<TRoleOutRequestDto>>;
}

export class UpdateRoleUseCaseRepo implements IUpdateRoleUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly roleRepository: IRoleRepository
  ) {}
  async execute(
    id: string,
    data: TUpdateRoleDto
  ): Promise<TResponseDto<TRoleOutRequestDto>> {
    try {
      this.logger.info("[UpdateRoleUseCase] Updating role:", {
        ...data,
      });
      // 1. Validate data
      const roleValidation = await updateRoleSchema.safeParseAsync(data);
      if (!roleValidation.success) {
        this.logger.error(
          "[UpdateRoleUseCase] Validation failed:",
          roleValidation.error.errors
        );
        return {
          data: null,
          success: false,
          message: roleValidation.error.errors
            .map((err) => err.message)
            .join(", "),
        };
      }

      if (!id) {
        this.logger.error("[UpdateRoleUseCase] ID is required");
        return {
          success: false,
          message: "ID is required",
          data: null,
        };
      }

      // 2. Find if role exists by id
      const existingRoleById = await this.roleRepository.findById(id);
      if (!existingRoleById) {
        this.logger.warn("[UpdateRoleUseCase] Role not found by ID");
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }

      // 3. Check if role name already exists
      const existingRoleName = await this.roleRepository.findByName(data.name);
      if (existingRoleName && existingRoleName.name !== existingRoleById.name) {
        this.logger.warn("[UpdateRoleUseCase] Role name already exists");
        return {
          success: false,
          message: RoleAppEnum.roleAlreadyExists,
          data: null,
        };
      }

      RoleEntity.update({
        name: data.name,
        description: data.description,
      });

      // 3. Update role
      await this.roleRepository.update(id, {
        ...data,
      });

      // 4. Find the updated role
      const roleAfterUpdate = await this.roleRepository.findById(id);
      if (!roleAfterUpdate) {
        this.logger.error("[UpdateRoleUseCase] Role not found after update");
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }
      this.logger.info("[UpdateRoleUseCase] Role updated successfully:", {
        ...roleAfterUpdate,
      });

      // 5. Return the updated role
      return {
        success: true,
        data: roleAfterUpdate,
        message: RoleAppEnum.roleUpdatedSuccessfully,
      };
    } catch (error) {
      this.logger.error("UpdateRoleUseCase: Error updating role:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}
