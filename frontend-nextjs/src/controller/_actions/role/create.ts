"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";

export type CreateRoleInput = {
  name: string;
  description?: string;
};

export async function createRoleAction(input: CreateRoleInput) {
  const name = (input.name ?? "").trim();
  const description = (input.description ?? "").trim();

  if (!name) {
    throw new Error("Name is required.");
  }
  if (name.length > 80) {
    throw new Error("Name is too long (max 80 chars).");
  }
  if (description.length > 500) {
    throw new Error("Description is too long (max 500 chars).");
  }

  // Optional uniqueness guard by normalized name
  const name_lc = name.toLowerCase();
  const dup = await adminDb
    .collection("roles")
    .where("name_lc", "==", name_lc)
    .limit(1)
    .get();

  if (!dup.empty) {
    throw new Error("A role with this name already exists.");
  }

  const docRef = await adminDb.collection("roles").add({
    name,
    description,
    name_lc,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { ok: true as const, id: docRef.id };
}
