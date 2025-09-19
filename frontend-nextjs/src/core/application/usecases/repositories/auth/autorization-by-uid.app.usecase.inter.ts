import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IAuthorizationByUIdAppUseCase } from "../../interfaces/auth/autorization-by-uid.app.usecase.inter";
import { IAuthRepository } from "@/core/application/interfaces/auth.app.inter";

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
