export interface ILogoutAppUseCase {
  execute(uid: string): Promise<void>;
}
