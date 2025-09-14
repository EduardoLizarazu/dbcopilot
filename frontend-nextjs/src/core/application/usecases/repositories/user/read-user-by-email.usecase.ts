import { UserEntity } from "@/core/domain/entities/user.domain.entity";
import { IUserRepository } from "@/core/application/interfaces/user.app.inter";
import { IReadByEmailUserAppUseCase } from "../../interfaces/user/read-user-by-email.usecase.inter";
import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { UserAppEnum } from "@/core/application/enums/user.app.enum";

export class ReadByNameUserUseCase implements IReadByEmailUserAppUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<TResponseDto> {
    try {
      const user = await this.userRepository.findByEmail(email);
      return {
        success: true,
        data: user,
        message: user
          ? UserAppEnum.userFoundSuccessfully
          : UserAppEnum.userNotFound,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
