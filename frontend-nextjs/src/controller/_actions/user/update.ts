"use server";

import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";

export type UpdateUserInput = {
  userId: string;
  email: string;
  name: string;
  lastname: string;
  roleIds: string[]; // single source of truth
  password?: string; // ✅ optional
};

export async function updateUserAction(input: UpdateUserInput) {
  const userId = (input.userId ?? "").trim();
  const email = (input.email ?? "").trim();
  const name = (input.name ?? "").trim();
  const lastname = (input.lastname ?? "").trim();
  const roleIds = Array.isArray(input.roleIds)
    ? input.roleIds.filter(Boolean)
    : [];
  const password = (input.password ?? "").trim(); // ✅

  if (!userId) throw new Error("Missing userId.");
  if (!email) throw new Error("Email is required.");
  if (!name) throw new Error("Name is required.");
  if (!lastname) throw new Error("Lastname is required.");
  if (password && password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  const email_lc = email.toLowerCase();

  // Firestore email uniqueness (exclude current user)
  const dupFS = await adminDb
    .collection("users")
    .where("email_lc", "==", email_lc)
    .limit(5)
    .get();
  const fireDup = dupFS.docs.some((d) => d.id !== userId);
  if (fireDup)
    throw new Error("There cannot be more than one user with the same email.");

  // Auth email uniqueness
  try {
    const byEmail = await adminAuth.getUserByEmail(email);
    if (byEmail && byEmail.uid !== userId) {
      throw new Error(
        "There cannot be more than one user with the same email."
      );
    }
  } catch (e: any) {
    const code = e?.errorInfo?.code;
    if (code && code !== "auth/user-not-found") {
      throw new Error(e?.message ?? "Unable to verify email uniqueness.");
    }
  }

  // Update in Firebase Auth (email/displayName always; password only if provided)
  try {
    const displayName = `${name} ${lastname}`.trim();
    const payload: { email: string; displayName: string; password?: string } = {
      email,
      displayName,
    };
    if (password) payload.password = password; // ✅ update only when provided
    await adminAuth.updateUser(userId, payload);
  } catch (e) {
    // If password was requested and Auth update failed, surface the error
    if (password) {
      throw new Error("Failed to update password in Authentication.");
    }
    // Otherwise ignore (e.g., Auth user missing) and continue with Firestore update
  }

  // Update Firestore profile (no password stored)
  await adminDb.collection("users").doc(userId).set(
    {
      name,
      lastname,
      email,
      email_lc,
      roleIds, // ✅ single source of truth
      updatedAt: new Date(),
    },
    { merge: true }
  );

  return { ok: true as const };
}
