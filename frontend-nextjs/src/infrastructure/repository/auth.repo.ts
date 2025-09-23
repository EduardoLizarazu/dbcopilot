import { IAuthorizationRepository } from "@/core/application/interfaces/auth/auth.app.inter";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export class AuthorizationRepository implements IAuthorizationRepository {
  constructor(
    private readonly logger: ILogger,
    private firebaseAdmin: FirebaseAdminProvider
  ) {}

  async hasRoles(data: {
    ctxRoleNames: string[];
    requiredRoleNames: string[];
  }): Promise<{ hasAuth: boolean }> {
    const { ctxRoleNames, requiredRoleNames } = data;
    const hasAuth = requiredRoleNames.every((role) =>
      ctxRoleNames.includes(role)
    );
    return { hasAuth };
  }
  async findRolesNamesByUserId(uid: string): Promise<{ roleNames: string[] }> {
    try {
      this.logger.info("AuthService: Fetching roles for UID:", uid);

      const user = await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_USERS)
        .where("uid", "==", uid)
        .get();
      if (user.empty) {
        console.log("No user found with UID:", uid);
        return { roleNames: [] };
      }

      this.logger.info("AuthService: User found:", user.docs[0].data());

      const userData = user.docs[0].data();
      const roles: string[] = userData.roleIds || [];

      this.logger.info("AuthService: User roles IDs:", roles);

      // Fetch by roles document ids
      const rolesDocs = await Promise.all(
        roles.map(async (roleId) => {
          const roleDoc = await this.firebaseAdmin.db
            .collection(this.firebaseAdmin.coll.NLQ_ROLES)
            .doc(roleId)
            .get();
          return roleDoc.data();
        })
      );

      const rolesName = rolesDocs.map((role) => role?.name);

      console.log("Role names:", rolesName);
      return { roleNames: rolesName as string[] };
    } catch (error) {
      this.logger.error("Error fetching role names", error);
      return { roleNames: [] };
    }
  }
}
