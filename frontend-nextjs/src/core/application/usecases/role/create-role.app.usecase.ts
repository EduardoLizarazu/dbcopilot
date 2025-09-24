import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import {
  createRoleSchema,
  TCreateRoleDto,
  TRoleOutRequestDto,
} from "@/core/application/dtos/role.app.dto";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { RoleEntity } from "@/core/domain/entities/role.domain.entity";
import { RoleAppEnum } from "../../enums/role.app.enum";

export interface ICreateRoleAppUseCase {
  execute(data: TCreateRoleDto): Promise<TResponseDto<TRoleOutRequestDto>>;
}

export class CreateRoleUseCase implements ICreateRoleAppUseCase {
  constructor(
    private roleRepository: IRoleRepository,
    private logger: ILogger
  ) {}

  async execute(
    data: TCreateRoleDto
  ): Promise<TResponseDto<TRoleOutRequestDto>> {
    try {
      this.logger.info("[CreateRoleUseCase] Executing with data:", data);

      // 1. Validation
      const roleValidation = createRoleSchema.safeParse(data);
      if (!roleValidation.success) {
        this.logger.error(
          "[CreateRoleUseCase] Validation failed:",
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
      const newRole = RoleEntity.create({
        name: data.name,
        description: data.description,
      });

      // 2. Check if role already exists by name
      const roleAlreadyExists = await this.roleRepository.findByName(
        newRole.name
      );

      if (roleAlreadyExists) {
        this.logger.error(
          "[CreateRoleUseCase] Role already exists with name:",
          newRole.name
        );
        return {
          data: null,
          success: false,
          message: RoleAppEnum.roleAlreadyExists,
        };
      }

      // 3. Create role
      const roleId = await this.roleRepository.create({
        ...data,
      });

      // 4. Find Role just created to return
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        this.logger.error(
          "[CreateRoleUseCase] Role not found after creation with ID:",
          roleId
        );
        return {
          data: null,
          success: false,
          message: RoleAppEnum.roleNotFound,
        };
      }

      this.logger.info("[CreateRoleUseCase] Role created:", newRole);
      return {
        data: role,
        success: true,
        message: RoleAppEnum.roleCreatedSuccessfully,
      };
    } catch (error) {
      this.logger.error("[CreateRoleUseCase] Unexpected error:", error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
