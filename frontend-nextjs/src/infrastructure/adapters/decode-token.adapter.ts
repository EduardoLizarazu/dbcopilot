import { TTokenDecodedDto } from "@/core/application/dtos/auth.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IDecodeTokenPort } from "@/core/application/ports/decode-token.port";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";

export class DecodeTokenAdapter implements IDecodeTokenPort {
  constructor(
    private readonly logger: ILogger,
    private readonly fbAdminProvider: FirebaseAdminProvider
  ) {}
  async decodeToken(token: string): Promise<TTokenDecodedDto | null> {
    try {
      this.logger.info("[DecodeTokenAdapter] Decoding token: ", token);

      // Implementation for decoding the token
      const decodedToken = await this.fbAdminProvider.auth.verifyIdToken(token);
      this.logger.info("[DecodeTokenAdapter] Decoded token: ", decodedToken);
      if (!decodedToken || !decodedToken.sub) {
        this.logger.warn("[DecodeTokenAdapter] Invalid token structure");
        return null;
      }
      return {
        uid: decodedToken.sub,
      } as TTokenDecodedDto;
    } catch (error) {
      this.logger.error("Error decoding token", error);
      return null;
    }
  }
}
