export interface ILogoutAppUseCase {
  execute(uid: string): Promise<void>;
}

export class LogoutUseCase implements ILogoutAppUseCase {
  constructor(
    private authRepository: any,
    private logger: any
  ) {}

  async execute(uid: string): Promise<void> {
    try {
      await this.authRepository.logout(uid);
      this.logger.info("Logout successful for user:", uid);
    } catch (error) {
      this.logger.error("Logout failed for user:", uid, error);
      throw error;
    }
  }
}
