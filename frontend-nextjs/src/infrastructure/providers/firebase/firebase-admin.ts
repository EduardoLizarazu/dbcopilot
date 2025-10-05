import { getApps, initializeApp, cert, getApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

enum FbCollection {
  NLQ_QA = "nlq_qa",
  NLQ_FEEDBACKS = "nlq_feedbacks",
  NLQ_ERRORS = "nlq_errors",
  NLQ_GOODS = "nlq_goods",
  NLQ_GOODS_DETAILS = "nlq_goods_details",
  NLQ_USERS = "nlq_users",
  NLQ_ROLES = "nlq_roles",
  VBD_SPLITTERS = "vbd_splitters",
  DB_CONNECTIONS = "db_connections",
}

// Handle \n when key is stored in a single-line env var
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
} else {
  adminApp = getApp();
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export class FirebaseAdminProvider {
  private app: App;
  private readonly _coll = FbCollection;

  constructor() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    this.app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });
  }

  get auth() {
    return getAuth(this.app);
  }

  get coll() {
    return this._coll;
  }

  get db() {
    return getFirestore(this.app);
  }

  getApp() {
    return this.app;
  }
}
