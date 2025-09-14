// controller/_actions/user/roles.ts
import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";

export type RoleOption = { id: string; name: string; description?: string };

export async function listRolesForUserForm(): Promise<RoleOption[]> {
  const snap = await adminDb.collection("roles").limit(1000).get();
  const roles: RoleOption[] = snap.docs.map((d) => {
    const x = d.data() as any;
    return { id: d.id, name: x?.name ?? "", description: x?.description ?? "" };
  });
  roles.sort((a, b) => a.name.localeCompare(b.name));
  return roles;
}
