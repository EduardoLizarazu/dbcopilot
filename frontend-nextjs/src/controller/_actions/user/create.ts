"use server";

import {
  adminAuth,
  adminDb,
} from "@/infrastructure/providers/firebase/firebase-admin";

export type CreateUserInput = {
  email: string;
  name: string;
  lastname: string;
  password: string;
  roleIds: string[]; // single source of truth
};

export async function createUserAction(input: CreateUserInput) {
  const email = (input.email ?? "").trim();
  const name = (input.name ?? "").trim();
  const lastname = (input.lastname ?? "").trim();
  const password = (input.password ?? "").trim();
  const roleIds = Array.isArray(input.roleIds)
    ? input.roleIds.filter(Boolean)
    : [];

  if (!email) throw new Error("Email is required.");
  if (!name) throw new Error("Name is required.");
  if (!lastname) throw new Error("Lastname is required.");
  if (!password || password.length < 6)
    throw new Error("Password must be at least 6 characters.");

  const email_lc = email.toLowerCase();

  // Firestore uniqueness
  const dupFS = await adminDb
    .collection("users")
    .where("email_lc", "==", email_lc)
    .limit(1)
    .get();
  if (!dupFS.empty)
    throw new Error("There cannot be more than one user with the same email.");

  // Auth uniqueness
  try {
    const existing = await adminAuth.getUserByEmail(email);
    if (existing)
      throw new Error(
        "There cannot be more than one user with the same email."
      );
  } catch (e: any) {
    if (e?.errorInfo?.code && e.errorInfo.code !== "auth/user-not-found") {
      throw new Error(e?.message ?? "Unable to verify email uniqueness.");
    }
  }

  // Create in Auth
  const displayName = `${name} ${lastname}`.trim();
  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName,
    disabled: false,
  });

  // Create Firestore profile (only roleIds)
  try {
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      lastname,
      email,
      email_lc,
      roleIds, // ✅ single source of truth
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (err) {
    await adminAuth.deleteUser(userRecord.uid).catch(() => {});
    throw new Error(
      "User created in Auth, but failed to write profile. Rolled back."
    );
  }

  return { ok: true as const, uid: userRecord.uid };
}
