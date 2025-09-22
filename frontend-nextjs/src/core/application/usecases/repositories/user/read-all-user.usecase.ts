import { IUserRepository } from "@/core/application/interfaces/auth/user.app.inter";
import { IReadAllUserAppUseCase } from "../../interfaces/user/read-all-user.app.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { UserAppEnum } from "@/core/application/enums/user.app.enum";

export class ReadAllUserUseCase implements IReadAllUserAppUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<TResponseDto> {
    try {
      const users = await this.userRepository.findAll();
      return {
        success: true,
        message: users.length
          ? UserAppEnum.userFoundSuccessfully
          : UserAppEnum.userNotFound,
        data: users,
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
