import { RoleEntity } from "@/core/domain/entities/role.domain.entity";
import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { ICreateRoleAppUseCase } from "../../interfaces/role/create-role.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";
import {
  createRoleSchema,
  TCreateRoleDto,
} from "@/core/application/dtos/role.domain.dto";

export class CreateRoleUseCase implements ICreateRoleAppUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(data: TCreateRoleDto): Promise<TResponseDto> {
    try {
      // Validation
      const roleValidation = createRoleSchema.safeParse(data);
      if (!roleValidation.success) {
        return {
          data: null,
          success: false,
          message: roleValidation.error.errors
            .map((err) => err.message)
            .join(", "),
        };
      }
      const newRole = RoleEntity.create({
        name: data.name,
        description: data.description,
      });

      // already exists?
      const roleAlreadyExists = await this.roleRepository.findByName(
        newRole.name
      );
      if (roleAlreadyExists) {
        return {
          data: null,
          success: false,
          message: RoleAppEnum.roleAlreadyExists,
        };
      }

      await this.roleRepository.create({
        name: newRole.name,
        description: newRole.description,
      });

      return {
        data: newRole,
        success: true,
        message: RoleAppEnum.roleCreatedSuccessfully,
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
