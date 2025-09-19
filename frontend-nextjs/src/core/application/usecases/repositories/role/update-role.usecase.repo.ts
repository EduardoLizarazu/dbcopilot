import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { IUpdateRoleAppUseCase } from "../../interfaces/role/update-role.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";
import { RoleEntity } from "@/core/domain/entities/role.domain.entity";
import {
  TUpdateRoleDto,
  updateRoleSchema,
} from "@/core/application/dtos/role.app.dto";
import { TRequesterDto } from "@/core/application/dtos/requester.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadByIdRoleAppUseCase } from "../../interfaces/role/read-role-by-id.app.usecase.inter";

export class UpdateRoleUseCaseRepo implements IUpdateRoleAppUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly logger: ILogger,
    private readonly readRoleByIdUseCase: IReadByIdRoleAppUseCase
  ) {}
  async execute(
    id: string,
    data: TUpdateRoleDto,
    requester: TRequesterDto
  ): Promise<TResponseDto> {
    try {
      // Schema Validation
      const roleValidation = updateRoleSchema.safeParse(data);
      if (!roleValidation.success) {
        return {
          success: false,
          message: roleValidation.error.errors
            .map((err) => err.message)
            .join(", "),
          data: null,
        };
      }

      // logger
      this.logger.info("UpdateRoleUseCase: Updating role with ID:", id);

      const existingRole = await this.readRoleByIdUseCase.execute(id);
      if (!existingRole) {
        this.logger.warn("UpdateRoleUseCase: Role not found");
        return {
          success: false,
          message: RoleAppEnum.roleNotFound,
          data: null,
        };
      }

      const updatedRole = RoleEntity.update({
        name: data.name,
        description: data.description,
      });

      await this.roleRepository.update(id, {
        id: id,
        name: updatedRole.name,
        description: updatedRole.description,
        updatedBy: requester.uid,
        updatedAt: new Date(),
      });

      // Find the updated role
      const roleAfterUpdate = await this.readRoleByIdUseCase.execute(id);
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
