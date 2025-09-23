import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import {
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "@/core/application/dtos/role.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { RoleAppEnum } from "../../enums/role.app.enum";
import { RoleEntity } from "@/core/domain/entities/role.domain.entity";

export interface IUpdateRoleAppUseCase {
  execute(
    id: string,
    data: TUpdateRoleDto
  ): Promise<TResponseDto<TRoleOutRequestDto>>;
}

export class UpdateRoleUseCaseRepo implements IUpdateRoleAppUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly roleRepository: IRoleRepository
  ) {}
  async execute(
    id: string,
    data: TUpdateRoleDto
  ): Promise<TResponseDto<TRoleOutRequestDto>> {
    try {
      // logger
      this.logger.info("UpdateRoleUseCase: Updating role with ID:", id);

      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole) {
        this.logger.warn("UpdateRoleUseCase: Role not found");
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }

      RoleEntity.update({
        name: data.name,
        description: data.description,
      });

      await this.roleRepository.update(id, {
        ...data,
      });

      // Find the updated role
      const roleAfterUpdate = await this.roleRepository.findById(id);
      if (!roleAfterUpdate) {
        this.logger.error("UpdateRoleUseCase: Role not found after update");
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }
      this.logger.info("UpdateRoleUseCase: Role updated successfully:", {
        ...roleAfterUpdate,
      });

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
