import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TUserOutputRequestDto } from "../../dtos/auth/user.app.dto";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { UserAppEnum } from "../../enums/user.app.enum";

export interface IReadAllUserAppUseCase {
  execute(): Promise<TResponseDto<TUserOutputRequestDto[]>>;
}

export class ReadAllUserUseCase implements IReadAllUserAppUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(): Promise<TResponseDto<TUserOutputRequestDto[]>> {
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
