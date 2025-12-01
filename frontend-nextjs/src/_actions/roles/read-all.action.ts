"use server";

import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { domain } from "@/utils/constants";

export async function ReadAllRolesAction(): Promise<
  TResOutContent<TRoleOutRequestDto[]>
> {
  console.log("Reading all roles...");
  const rolesRes = await fetch(`/api/roles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", rolesRes);
  if (!rolesRes.ok) {
    const errorData = await rolesRes.json();
    console.error(
      "Error fetching roles:",
      errorData.message || rolesRes.statusText
    );
    return {
      ok: false,
      data: [],
      message: errorData.message || "Failed to fetch roles.",
    };
  }
  const rolesData = await rolesRes.json();
  console.log("Fetched roles:", rolesData);
  return {
    ok: true,
    data: rolesData.data || [],
    message: rolesData.message,
  };
}

import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";

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
  const snap = await adminDb.collection("nlq_roles").limit(500).get();
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
