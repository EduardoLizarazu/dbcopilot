import { RoleEntity } from "@/core/domain/entities/role.domain.entity";
import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { ICreateRoleAppUseCase } from "../../interfaces/role/create-role.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { RoleAppEnum } from "@/core/application/enums/role.app.enum";
import {
  createRoleSchema,
  TCreateRoleDto,
} from "@/core/application/dtos/role.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export class CreateRoleUseCase implements ICreateRoleAppUseCase {
  constructor(
    private roleRepository: IRoleRepository,
    private logger: ILogger
  ) {}

  async execute(data: TCreateRoleDto): Promise<TResponseDto> {
    try {
      this.logger.info("CreateRoleUseCase: Executing with data:", data);

      // Validation
      const roleValidation = createRoleSchema.safeParse(data);
      if (!roleValidation.success) {
        this.logger.error(
          "CreateRoleUseCase: Validation failed:",
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

      // already exists?
      const roleAlreadyExists = await this.roleRepository.findByName(
        newRole.name
      );

      if (roleAlreadyExists) {
        this.logger.error(
          "CreateRoleUseCase: Role already exists with name:",
          newRole.name
        );
        return {
          data: null,
          success: false,
          message: RoleAppEnum.roleAlreadyExists,
        };
      }

      const role = await this.roleRepository.create({
        name: newRole.name,
        description: newRole.description,
      });
      this.logger.info("CreateRoleUseCase: Role created:", role);
      return {
        data: role,
        success: true,
        message: RoleAppEnum.roleCreatedSuccessfully,
      };
    } catch (error) {
      this.logger.error("CreateRoleUseCase: Unexpected error:", error);
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
