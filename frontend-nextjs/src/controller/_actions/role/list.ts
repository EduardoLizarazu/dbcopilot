"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";

export type Role = {
  id: string;
  name: string;
  description?: string;
};

/**
 * Lists roles. If `q` is provided, filters by name (case-insensitive).
 * NOTE: For large datasets, consider storing a normalized field (e.g., name_lc)
 * and querying by range with an index. This in-memory filter is fine to start.
 */
export async function listRolesAction(q?: string): Promise<Role[]> {
  // fetch up to 500 roles (tune as needed)
  const snap = await adminDb.collection("roles").limit(500).get();
  let roles: Role[] = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      name: data?.name ?? "",
      description: data?.description ?? "",
    };
  });

  if (q && q.trim()) {
    const s = q.trim().toLowerCase();
    roles = roles.filter((r) => r.name?.toLowerCase().includes(s));
  }

  // Sort by name for stable UI
  roles.sort((a, b) => a.name.localeCompare(b.name));
  return roles;
}
