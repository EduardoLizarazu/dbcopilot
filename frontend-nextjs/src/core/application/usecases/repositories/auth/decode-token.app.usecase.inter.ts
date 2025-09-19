import { IAuthRepository } from "@/core/application/interfaces/auth.app.inter";
import { IDecodeTokenAppUseCase } from "../../interfaces/auth/decode-token.app.usecase.inter";

export class DecodeTokenUseCase implements IDecodeTokenAppUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private logger: any
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
