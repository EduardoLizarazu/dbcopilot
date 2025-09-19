export interface IAuthorizationByUIdAppUseCase {
  execute(uid: string): Promise<{ roles_names: string[] }>;
}
