"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  lastname: string;
  roleIds: string[];
};

export async function getUserAction(
  userId: string
): Promise<UserProfile | null> {
  if (!userId) throw new Error("Missing userId");
  const doc = await adminDb.collection("users").doc(userId).get();
  if (!doc.exists) return null;

  const data = doc.data() as any;
  const roleIds: string[] = Array.isArray(data?.roleIds)
    ? data.roleIds
    : data?.roleId
      ? [data.roleId]
      : [];

  return {
    id: doc.id,
    email: data?.email ?? "",
    name: data?.name ?? "",
    lastname: data?.lastname ?? "",
    roleIds,
  };
}
