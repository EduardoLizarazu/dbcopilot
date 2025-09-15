// src/infrastructure/services/auth-service.infra.ts
import { Auth } from "firebase-admin/auth";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";

export interface IAuthService {
  decodeToken(token: string): Promise<any>;
  getRolesNamesByUids(uid: string): Promise<string[]>;
}

export class FirebaseAuthService implements IAuthService {
  private auth: Auth;
  private admin_db: FirebaseAdminProvider;

  constructor(authInstance: Auth, adminDbProvider: FirebaseAdminProvider) {
    this.auth = authInstance;
    this.admin_db = adminDbProvider;
  }

  async decodeToken(token: string): Promise<any> {
    const decodedToken = await this.auth.verifyIdToken(token);
    return decodedToken;
  }

  async getRolesNamesByUids(uid: string): Promise<string[]> {
    try {
      console.log("Fetching roles for UID:", uid);

      const user = await this.admin_db.db
        .collection("users")
        .where("uid", "==", uid)
        .get();
      if (user.empty) {
        console.log("No user found with UID:", uid);
        return [];
      }

      console.log("User found:", user.docs[0].data());

      const userData = user.docs[0].data();
      const roles: string[] = userData.roleIds || [];

      console.log("User roles IDs:", roles);

      // Fetch by roles document ids
      const rolesDocs = await Promise.all(
        roles.map(async (roleId) => {
          const roleDoc = await this.admin_db.db
            .collection("roles")
            .doc(roleId)
            .get();
          return roleDoc.data();
        })
      );

      const rolesName = rolesDocs.map((role) => role?.name);

      console.log("Role names:", rolesName);
      return rolesName as string[];
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
  }
}
