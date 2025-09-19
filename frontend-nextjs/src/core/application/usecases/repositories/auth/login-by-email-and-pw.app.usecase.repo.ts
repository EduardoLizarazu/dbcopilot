import { IAuthRepository } from "@/core/application/interfaces/auth.app.inter";
import { ILoginByEmailAndPwAppUseCase } from "../../interfaces/auth/login-by-email-and-pw.app.usecase.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

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
