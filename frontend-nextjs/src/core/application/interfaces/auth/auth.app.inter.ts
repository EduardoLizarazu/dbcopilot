export interface IAuthorizationRepository {
  hasRoles(data: {
    ctxRoleNames: string[];
    requiredRoleNames: string[];
  }): Promise<{ hasAuth: boolean }>;
  findRolesNamesByUserId(uid: string): Promise<{ roleNames: string[] }>;
}
