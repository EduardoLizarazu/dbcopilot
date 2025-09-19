export interface ILoginByEmailAndPwAppUseCase {
  execute(email: string, password: string): Promise<{ token: string } | null>;
}
