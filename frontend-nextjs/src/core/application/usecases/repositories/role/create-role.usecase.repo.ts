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
import {
  requesterSchema,
  TRequesterDto,
} from "@/core/application/dtos/requester.app.dto";
import { AuthRoleAppEnum } from "@/core/application/enums/auth.app.enum";

export class CreateRoleUseCase implements ICreateRoleAppUseCase {
  constructor(
    private roleRepository: IRoleRepository,
    private logger: ILogger
  ) {}

  async execute(
    data: TCreateRoleDto,
    requester: TRequesterDto
  ): Promise<TResponseDto> {
    try {
      // Validate requester
      const requesterValidation = requesterSchema.safeParse(requester);
      if (!requesterValidation.success) {
        this.logger.error(
          "CreateRoleUseCase: Invalid requester:",
          requesterValidation.error.errors
        );
        return {
          data: null,
          success: false,
          message: "Invalid requester",
        };
      }

      // Check authorization lower case admin
      if (
        !requester.roles
          .map((r) => r.toLowerCase())
          .includes(AuthRoleAppEnum.ADMIN_ROLE)
      ) {
        this.logger.error(
          "CreateRoleUseCase: Unauthorized access attempt by user:",
          `${requester.uid} with roles: ${requester.roles.join(", ")}`
        );
        return {
          data: null,
          success: false,
          message: "Unauthorized",
        };
      }

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
        createdBy: requester.uid,
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
