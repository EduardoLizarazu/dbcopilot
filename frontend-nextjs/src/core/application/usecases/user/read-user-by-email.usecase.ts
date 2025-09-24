import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TUserOutputRequestDto } from "../../dtos/user.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";
import { UserAppEnum } from "../../enums/user.app.enum";

export interface IReadByEmailUserAppUseCase {
  execute(email: string): Promise<TResponseDto<TUserOutputRequestDto | null>>;
}

export class ReadByNameUserUseCase implements IReadByEmailUserAppUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    email: string
  ): Promise<TResponseDto<TUserOutputRequestDto | null>> {
    try {
      const user = await this.userRepository.findByEmail(email);
      this.logger.info("ReadByEmailUserUseCase: User found:", user);

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
