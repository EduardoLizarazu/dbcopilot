import { UserEntity } from "@/core/domain/entities/user.domain.entity";
import { IUserRepository } from "@/core/application/interfaces/user.app.inter";
import { IUpdateUserAppUseCase } from "../../interfaces/user/update-user.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { TUpdateUserDto } from "@/core/application/dtos/user.domain.dto";
import { UserAppEnum } from "@/core/application/enums/user.app.enum";

export class UpdateUserUseCase implements IUpdateUserAppUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string, user: TUpdateUserDto): Promise<TResponseDto> {
    try {
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
