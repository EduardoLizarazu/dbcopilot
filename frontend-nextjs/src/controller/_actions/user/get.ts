"use server";

import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  lastname: string;
  roleIds: string[]; // single source of truth
};

export async function getUserAction(
  userId: string
): Promise<UserProfile | null> {
  if (!userId) throw new Error("Missing userId");
  const doc = await adminDb.collection("users").doc(userId).get();
  if (!doc.exists) return null;
  const data = doc.data() as any;

  return {
    id: doc.id,
    email: data?.email ?? "",
    name: data?.name ?? "",
    lastname: data?.lastname ?? "",
    roleIds: Array.isArray(data?.roleIds) ? data.roleIds : [],
  };
}
