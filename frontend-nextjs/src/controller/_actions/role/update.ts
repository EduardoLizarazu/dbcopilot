"use server";

import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";

export type UpdateRoleInput = {
  roleId: string;
  name: string;
  description?: string;
};

export async function updateRoleAction({
  roleId,
  name,
  description,
}: UpdateRoleInput) {
  const id = (roleId ?? "").trim();
  const newName = (name ?? "").trim();
  const desc = (description ?? "").trim();

  if (!id) throw new Error("Missing roleId.");
  if (!newName) throw new Error("Name is required.");
  if (newName.length > 80) throw new Error("Name is too long (max 80 chars).");
  if (desc.length > 500)
    throw new Error("Description is too long (max 500 chars).");

  const ref = adminDb.collection("roles").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Role not found.");

  const newNameLC = newName.toLowerCase();

  // Check for duplicates: any other doc with the same normalized name
  const dupQ = await adminDb
    .collection("roles")
    .where("name_lc", "==", newNameLC)
    .limit(2)
    .get();

  const duplicateExists = dupQ.docs.some((d) => d.id !== id);
  if (duplicateExists) {
    throw new Error("There cannot be more than one role with the same name.");
  }

  await ref.update({
    name: newName,
    description: desc,
    name_lc: newNameLC,
    updatedAt: new Date(),
  });

  return { ok: true as const };
}
