import { UserEntity } from "@/core/domain/entities/user.domain.entity";
import { IUserRepository } from "@/core/application/interfaces/user.app.inter";
import { IUpdateUserAppUseCase } from "../../interfaces/user/update-user.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import {
  TUpdateUserDto,
  userSchema,
} from "@/core/application/dtos/user.domain.dto";
import { UserAppEnum } from "@/core/application/enums/user.app.enum";
import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";

export class UpdateUserUseCase implements IUpdateUserAppUseCase {
  constructor(
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository
  ) {}

  async execute(id: string, user: TUpdateUserDto): Promise<TResponseDto> {
    try {
      // Validation
      const userValidation = userSchema.safeParse(user);
      if (!userValidation.success) {
        return {
          success: false,
          message: userValidation.error.errors
            .map((err) => err.message)
            .join(", "),
          data: null,
        };
      }

      if (!id)
        return {
          success: false,
          message: UserAppEnum.userIdNotFound,
          data: null,
        };
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
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
          return {
            success: false,
            message: `Role with ID ${roleId} not found`,
            data: null,
          };
        }
      }

      const updatedUser = UserEntity.update(user);
      const out = await this.userRepository.update(id, {
        name: updatedUser.name,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        password: updatedUser.password,
        roles: user.roles,
        id: existingUser.id,
      });
      return {
        success: true,
        message: UserAppEnum.userUpdatedSuccessfully,
        data: out,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        data: null,
      };
    }
  }
}
