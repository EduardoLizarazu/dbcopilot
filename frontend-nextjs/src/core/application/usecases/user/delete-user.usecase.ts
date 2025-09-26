import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { IUserRepository } from "../../interfaces/auth/user.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IDeleteUserUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(
    private readonly logger: ILogger,
    private userRepo: IUserRepository
  ) {}
  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      if (!id) {
        this.logger.error("[DeleteUserUseCase] User ID is required");
        return {
          success: false,
          message: "User ID is required",
          data: null,
        };
      }

      // 2. Check if user exists
      const user = await this.userRepo.findById(id);
      if (!user) {
        this.logger.error("[DeleteUserUseCase] User not found with ID:", id);
        return {
          success: false,
          message: "User not found",
          data: null,
        };
      }
      // 3. Delete user
      this.logger.info("[DeleteUserUseCase] Deleting user with ID:", id);
      await this.userRepo.delete(id);
      this.logger.info("[DeleteUserUseCase] User deleted successfully");
      return {
        success: true,
        message: "User deleted successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error("[DeleteUserUseCase] Error deleting user:", error);
      return {
        success: false,
        message: "Error deleting user",
        data: null,
      };
    }
  }
}
