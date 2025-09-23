import { IAuthRepository } from "../../interfaces/auth.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IAuthorizationByUIdAppUseCase {
  execute(uid: string): Promise<{ roles_names: string[] }>;
}

export class AuthorizationByUIdAppUseCase
  implements IAuthorizationByUIdAppUseCase
{
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly logger: ILogger
  ) {}
  async execute(uid: string): Promise<{ roles_names: string[] }> {
    try {
      throw new Error("Method not implemented.");
    } catch (error) {
      this.logger.error(`Error authorizing user: ${uid}`, error);
      throw new Error("Authorization failed");
    }
  }
}
