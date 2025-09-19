export interface IAuthRepository {
  login(email: string, password: string): Promise<{ token: string } | null>;
  logout(uid: string): Promise<void>;
  decodeToken(token: string): Promise<{ uid: string } | null>;
  authorization(
    uid: string,
    permitted_roles_names: string[],
    is_public: boolean
  ): Promise<{ isAuthorized: boolean }>;
}
