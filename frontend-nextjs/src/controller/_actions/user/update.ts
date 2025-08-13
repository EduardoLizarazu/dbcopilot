"use server";

import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";

export type UpdateUserInput = {
  userId: string;
  email: string;
  name: string;
  lastname: string;
  roleIds: string[];
};

export async function updateUserAction(input: UpdateUserInput) {
  const userId = (input.userId ?? "").trim();
  const email = (input.email ?? "").trim();
  const name = (input.name ?? "").trim();
  const lastname = (input.lastname ?? "").trim();
  const roleIds = Array.isArray(input.roleIds)
    ? input.roleIds.filter(Boolean)
    : [];

  if (!userId) throw new Error("Missing userId.");
  if (!email) throw new Error("Email is required.");
  if (!name) throw new Error("Name is required.");
  if (!lastname) throw new Error("Lastname is required.");

  const email_lc = email.toLowerCase();

  // ----- Firestore uniqueness (same email cannot belong to another user)
  const dupFS = await adminDb
    .collection("users")
    .where("email_lc", "==", email_lc)
    .limit(5)
    .get();

  const fireDup = dupFS.docs.some((d) => d.id !== userId);
  if (fireDup) {
    throw new Error("There cannot be more than one user with the same email.");
  }

  // ----- Firebase Auth uniqueness
  try {
    const byEmail = await adminAuth.getUserByEmail(email);
    if (byEmail && byEmail.uid !== userId) {
      throw new Error(
        "There cannot be more than one user with the same email."
      );
    }
  } catch (e: any) {
    // getUserByEmail throws if not found; that's fine. Only rethrow unexpected errors.
    const code = e?.errorInfo?.code;
    if (code && code !== "auth/user-not-found") {
      throw new Error(e?.message ?? "Unable to verify email uniqueness.");
    }
  }

  // ----- Update in Firebase Auth if the user exists there
  try {
    const displayName = `${name} ${lastname}`.trim();
    // If the Auth user doesn't exist, this will throw; we ignore and still update Firestore.
    await adminAuth.updateUser(userId, { email, displayName });
  } catch {
    // Optional: you could decide to fail instead. For now, continue with Firestore update.
  }

  // ----- Update Firestore profile
  await adminDb
    .collection("users")
    .doc(userId)
    .set(
      {
        name,
        lastname,
        email,
        email_lc,
        roleIds,
        // keep a single-role field for backwards compatibility (lists etc.)
        roleId: roleIds[0] ?? null,
        updatedAt: new Date(),
      },
      { merge: true }
    );

  return { ok: true as const };
}
