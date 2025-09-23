import { IAuthRepository } from "../../interfaces/auth/auth.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";

export interface ILoginByEmailAndPwAppUseCase {
  execute(email: string, password: string): Promise<{ token: string } | null>;
}

export class LoginByEmailAndPwUseCase implements ILoginByEmailAndPwAppUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private logger: ILogger
  ) {}

  async execute(
    email: string,
    password: string
  ): Promise<{ token: string } | null> {
    try {
      this.logger.info("Executing LoginByEmailAndPwUseCase");

      const out = await this.authRepository.login(email, password);
      if (!out || !out.token) {
        this.logger.error("Login failed for email:", email);
        return null;
      }

      this.logger.info("Login successful");
      return { token: out.token };
    } catch (error) {
      this.logger.error("LoginByEmailAndPwUseCase: Error during login:", error);
      return null;
    }
  }
}
