import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    });

export const clientAuth = getAuth(app);
export const clientDb = getFirestore(app);

// Ensure persistent sessions in the browser
setPersistence(clientAuth, browserLocalPersistence).catch(() => {});

export class FirebaseClientProvider {
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;

  constructor() {
    this.app = getApps().length
      ? getApp()
      : initializeApp({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
          messagingSenderId:
            process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        });

    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    setPersistence(this.auth, browserLocalPersistence).catch(() => {});
  }

  getAuth() {
    return this.auth;
  }

  getDb() {
    return this.db;
  }

  getApp() {
    return this.app;
  }
}
