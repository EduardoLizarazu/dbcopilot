import { TUserOutputRequestDto } from "../../dtos/user.app.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IReadUserByIdUseCase {
  execute(id: string): Promise<TResponseDto<TUserOutputRequestDto>>;
}

export class ReadUserByIdUseCase implements IReadUserByIdUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<TUserOutputRequestDto>> {
    try {
      this.logger.info(`[ReadUserByIdUseCase] Reading user with ID: ${id}`);
      // Fetch user by ID
      const user = await this.userRepo.findById(id);
      if (!user) {
        this.logger.warn(`[ReadUserByIdUseCase] User with ID ${id} not found`);
        return { success: false, data: null, message: "User not found" };
      }

      return {
        success: true,
        message: "User retrieved successfully",
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          roles: user.roles,
        },
      };
    } catch (error) {
      this.logger.error("[ReadUserByIdUseCase] Error:", error);
      return {
        success: false,
        data: null,
        message: "Error reading user by ID: " + (error as Error).message,
      };
    }
  }
}
