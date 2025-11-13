import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import {
  TUpdateUserDto,
  TUserOutputRequestDto,
  updateUserSchema,
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
      let userAux = null;
      if (!user.password) {
        userAux = {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          roles: user.roles,
        };
      } else {
        userAux = {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          roles: user.roles,
          password: user.password,
        };
      }

      // 1. Validation
      this.logger.info("Validating user data", user);
      const userValidation = await updateUserSchema.safeParseAsync({
        ...userAux,
      });
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

      // 2. Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        this.logger.error("User not found", { userId: id });
        return {
          success: false,
          message: UserAppEnum.userNotFound,
          data: null,
        };
      }

      // 3. Check if roles exist
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

      // 4. Check if email email already exists for another user
      if (user.email && user.email !== existingUser.email) {
        const userByEmail = await this.userRepository.findAllByEmail(
          user.email
        );
        if (userByEmail.length > 1) {
          this.logger.error("Email already exists for another user", {
            email: user.email,
          });
          return {
            success: false,
            message: `Email ${user.email} is already taken by another user`,
            data: null,
          };
        }
      }

      // 5. Update user with new data with password
      // const updatedUser = UserEntity.update(user);
      if (user.password) {
        await this.userRepository.update(id, {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          password: user.password,
          roles: user.roles,
          id: existingUser.id,
        });
      }
      if (!user.password) {
        await this.userRepository.update(id, {
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          roles: user.roles,
          id: existingUser.id,
        });
      }

      // 6. Return updated user
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

      // 7. Success
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
