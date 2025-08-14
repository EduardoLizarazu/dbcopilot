"use server";

import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";

export type UpdateUserInput = {
  userId: string;
  email: string;
  name: string;
  lastname: string;
  roleIds: string[]; // single source of truth
};

export async function updateUserAction(input: UpdateUserInput) {
  const userId = (input.userId ?? "").trim();
  const email = (input.email ?? "").trim();
  const name = (input.name ?? "").trim();
  const lastname = (input.lastname ?? "").trim();
  const roleIds = Array.isArray(input.roleIds) ? input.roleIds.filter(Boolean) : [];

  if (!userId) throw new Error("Missing userId.");
  if (!email) throw new Error("Email is required.");
  if (!name) throw new Error("Name is required.");
  if (!lastname) throw new Error("Lastname is required.");

  const email_lc = email.toLowerCase();

  // Firestore uniqueness (exclude current user)
  const dupFS = await adminDb.collection("users")
    .where("email_lc", "==", email_lc)
    .limit(5)
    .get();
  const fireDup = dupFS.docs.some((d) => d.id !== userId);
  if (fireDup) throw new Error("There cannot be more than one user with the same email.");

  // Auth uniqueness
  try {
    const byEmail = await adminAuth.getUserByEmail(email);
    if (byEmail && byEmail.uid !== userId) {
      throw new Error("There cannot be more than one user with the same email.");
    }
  } catch (e: any) {
    const code = e?.errorInfo?.code;
    if (code && code !== "auth/user-not-found") {
      throw new Error(e?.message ?? "Unable to verify email uniqueness.");
    }
  }

  // Update Auth (if exists)
  try {
    const displayName = `${name} ${lastname}`.trim();
    await adminAuth.updateUser(userId, { email, displayName });
  } catch {
    // ignore if Auth record missing; Firestore will still update
  }

  // Update Firestore (✅ write only roleIds)
  await adminDb.collection("users").doc(userId).set(
    {
      name,
      lastname,
      email,
      email_lc,
      roleIds,         // ✅ single source of truth
      updatedAt: new Date(),
    },
    { merge: true }
  );

  return { ok: true as const };
}
