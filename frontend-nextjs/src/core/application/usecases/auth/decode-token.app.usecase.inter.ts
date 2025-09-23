import { IAuthRepository } from "../../interfaces/auth/auth.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface IDecodeTokenAppUseCase {
  execute(token: string): Promise<{ uid: string } | null>;
}

export class DecodeTokenUseCase implements IDecodeTokenAppUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private logger: ILogger
  ) {}

  async execute(token: string): Promise<{ uid: string } | null> {
    try {
      const decoded = await this.authRepository.decodeToken(token);
      this.logger.info("Token decoded successfully:", decoded);

      if (!decoded || !decoded.uid) {
        this.logger.error("Token decoding failed: Invalid token");
        return null;
      }

      return { uid: decoded.uid };
    } catch (error) {
      this.logger.error("Token decoding failed:", error);
      throw error;
    }
  }
}
