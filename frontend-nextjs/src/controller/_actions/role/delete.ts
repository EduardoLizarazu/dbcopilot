"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";

/**
 * Deletes a role by ID.
 * You can add authorization checks here later (e.g., require admin claim).
 */
export async function deleteRoleAction(roleId: string) {
  if (!roleId) throw new Error("Missing roleId");
  await adminDb.collection("roles").doc(roleId).delete();
  return { ok: true };
}
