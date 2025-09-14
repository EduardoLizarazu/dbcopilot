"use server";

import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";

export type RoleRecord = {
  id: string;
  name: string;
  description?: string;
};

export async function getRoleAction(
  roleId: string
): Promise<RoleRecord | null> {
  if (!roleId) throw new Error("Missing roleId");
  const doc = await adminDb.collection("roles").doc(roleId).get();
  if (!doc.exists) return null;
  const data = doc.data() as any;
  return {
    id: doc.id,
    name: data?.name ?? "",
    description: data?.description ?? "",
  };
}
