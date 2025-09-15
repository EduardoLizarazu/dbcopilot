// src/infrastructure/services/auth-service.infra.ts
import { Auth } from "firebase-admin/auth";

export interface IAuthService {
  decodeToken(token: string): Promise<any>;
}

export class FirebaseAuthService implements IAuthService {
  private auth: Auth;

  constructor(authInstance: Auth) {
    this.auth = authInstance;
  }

  async decodeToken(token: string): Promise<any> {
    const decodedToken = await this.auth.verifyIdToken(token);
    return decodedToken;
  }
}
