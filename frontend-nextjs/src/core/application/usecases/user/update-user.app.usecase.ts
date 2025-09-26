import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import {
  TUpdateUserDto,
  TUserOutputRequestDto,
  userSchema,
} from "@/core/application/dtos/user.app.dto";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";
import { UserAppEnum } from "../../enums/user.app.enum";
import { UserEntity } from "@/core/domain/entities/user.domain.entity";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IUpdateUserUseCase {
  execute(
    id: string,
    data: TUpdateUserDto
  ): Promise<TResponseDto<TUserOutputRequestDto | null>>;
}

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly logger: ILogger,
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository
  ) {}

  async execute(
    id: string,
    user: TUpdateUserDto
  ): Promise<TResponseDto<TUserOutputRequestDto | null>> {
    try {
      // Validation
      this.logger.info("Validating user data", user);
      const userValidation = userSchema.safeParse(user);
      if (!userValidation.success) {
        this.logger.error(
          "User validation failed",
          userValidation.error.errors
        );
        return {
          success: false,
          message: userValidation.error.errors
            .map((err) => err.message)
            .join(", "),
          data: null,
        };
      }

      if (!id) {
        this.logger.error("User ID is required for update");
        return {
          success: false,
          message: UserAppEnum.userIdNotFound,
          data: null,
        };
      }
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        this.logger.error("User not found", { userId: id });
        return {
          success: false,
          message: UserAppEnum.userNotFound,
          data: null,
        };
      }

      // Check if roles exist
      for (const roleId of user.roles) {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
          this.logger.error("Role not found", { roleId });
          return {
            success: false,
            message: `Role with ID ${roleId} not found`,
            data: null,
          };
        }
      }

      const updatedUser = UserEntity.update(user);
      await this.userRepository.update(id, {
        name: updatedUser.name,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        password: updatedUser.password,
        roles: user.roles,
        id: existingUser.id,
      });

      const out = await this.userRepository.findById(id);
      this.logger.info("User updated successfully", out);
      if (!out) {
        this.logger.error("User not found", { userId: id });
        return {
          success: false,
          message: UserAppEnum.userNotFound,
          data: null,
        };
      }

      return {
        success: true,
        message: UserAppEnum.userUpdatedSuccessfully,
        data: out,
      };
    } catch (error) {
      this.logger.error("Error updating user", { error });
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}
