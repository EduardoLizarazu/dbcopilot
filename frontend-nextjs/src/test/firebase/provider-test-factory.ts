// src/test-utils/firebase/provider-test-factory.ts
import admin from "firebase-admin";

type CollMap = { NLQ_ROLES: string };

export const createTestFbAdminProvider = (runId: string) => {
  // Inicializá admin afuera en tu app real;
  // en tests podés inicializar si no hay app:
  if (!admin.apps.length) {
    admin.initializeApp({
      // si usás el mismo proyecto, esto puede quedar vacío si tus credenciales ya están en el entorno
      projectId: process.env.FIREBASE_PROJECT_ID,
      credential: admin.credential.applicationDefault(),
    });
  }

  const db = admin.firestore();
  const coll: CollMap = {
    NLQ_ROLES: `TEST_${runId}_NLQ_ROLES`, // colección aislada por test run
  };

  return { db, coll };
};
