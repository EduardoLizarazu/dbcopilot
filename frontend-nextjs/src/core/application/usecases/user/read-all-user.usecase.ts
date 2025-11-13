import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TUserOutRequestWithRoles } from "../../dtos/user.app.dto";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { UserAppEnum } from "../../enums/user.app.enum";

export interface IReadAllUserUseCase {
  execute(): Promise<TResponseDto<TUserOutRequestWithRoles[]>>;
}

export class ReadAllUserUseCase implements IReadAllUserUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(): Promise<TResponseDto<TUserOutRequestWithRoles[]>> {
    try {
      const users = await this.userRepository.findAllWithRoles();
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
