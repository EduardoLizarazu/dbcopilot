import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { IUpdateRoleAppUseCase } from "../../interfaces/role/update-role.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";
import { RoleEntity } from "@/core/domain/entities/role.domain.entity";
import {
  roleSchema,
  TUpdateRoleDto,
} from "@/core/application/dtos/role.domain.dto";

export class UpdateRoleUseCaseRepo implements IUpdateRoleAppUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}
  async execute(id: string, data: TUpdateRoleDto): Promise<TResponseDto> {
    try {
      // Schema Validation
      const roleValidation = roleSchema.safeParse(data);
      if (!roleValidation.success) {
        return {
          success: false,
          message: roleValidation.error.errors
            .map((err) => err.message)
            .join(", "),
          data: null,
        };
      }

      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole) {
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
      });

      return {
        success: true,
        data: updatedRole,
        message: RoleAppEnum.roleUpdatedSuccessfully,
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
