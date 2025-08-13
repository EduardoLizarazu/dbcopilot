// controller/_actions/user/create.ts
"use server";

import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";

export type CreateUserInput = {
  email: string;
  name: string;
  lastname: string;
  password: string;
  roleIds: string[]; // selected roles
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
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const email_lc = email.toLowerCase();

  // 1) Uniqueness: Firestore (defense in depth)
  const dupFS = await adminDb
    .collection("users")
    .where("email_lc", "==", email_lc)
    .limit(1)
    .get();
  if (!dupFS.empty) {
    throw new Error("There cannot be more than one user with the same email.");
  }

  // 2) Uniqueness: Firebase Auth
  try {
    const existing = await adminAuth.getUserByEmail(email);
    if (existing) {
      throw new Error(
        "There cannot be more than one user with the same email."
      );
    }
  } catch (e: any) {
    // getUserByEmail throws if not found; only ignore 'auth/user-not-found'
    if (e?.errorInfo?.code && e.errorInfo.code !== "auth/user-not-found") {
      throw new Error(e?.message ?? "Unable to verify email uniqueness.");
    }
  }

  // 3) Create in Auth
  const displayName = `${name} ${lastname}`.trim();
  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName,
    emailVerified: false,
    disabled: false,
  });

  // 4) Create Firestore user doc; roll back Auth if Firestore fails
  try {
    const doc = {
      uid: userRecord.uid,
      name,
      lastname,
      email,
      email_lc,
      roleIds, // multiple roles (authoritative)
      // compatibility fields if your current list expects a single role:
      roleId: roleIds[0] ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await adminDb.collection("users").doc(userRecord.uid).set(doc);
  } catch (err) {
    // rollback auth user to avoid orphaned auth user without profile doc
    await adminAuth.deleteUser(userRecord.uid).catch(() => {});
    throw new Error(
      "User created in Auth, but failed to write profile. Operation rolled back."
    );
  }

  return { ok: true as const, uid: userRecord.uid };
}
