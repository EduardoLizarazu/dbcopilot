import { IAuthorizationRepository } from "../../interfaces/auth/auth.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IReadUserRolesByUserIdStep {
  run(userId: string): Promise<{ roleNames: string[] }>;
}

export class ReadUserRolesByUserIdStep implements IReadUserRolesByUserIdStep {
  constructor(
    private readonly logger: ILogger,
    private readonly authorizationRepository: IAuthorizationRepository
  ) {}

  async run(userId: string): Promise<{ roleNames: string[] }> {
    try {
      this.logger.info(`Fetching roles for user: ${userId}`);
      if (!userId || userId.trim().length === 0) {
        this.logger.error(`Invalid userId provided: ${userId}`);
        throw new Error("Invalid userId provided");
      }
      const roles =
        await this.authorizationRepository.findRolesNamesByUserId(userId);

      if (!roles || roles?.roleNames.length === 0) {
        this.logger.error(`No roles found for userId: ${userId}`);
        throw new Error("No roles found for the given userId");
      }

      return { roleNames: roles.roleNames.map((role) => role) };
    } catch (error) {
      this.logger.error(
        "Error in ReadUserRolesByUserIdStep:",
        (error as any)?.message
      );
      throw new Error(
        (error as any)?.message || "Failed to read user roles by user ID."
      );
    }
  }
}
