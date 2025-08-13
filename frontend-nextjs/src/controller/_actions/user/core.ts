import { adminDb } from "@/lib/firebase/firebase-admin";
import { adminAuth } from "@/lib/firebase/firebase-admin";

export type UserRow = {
  id: string; // user doc id (ideally uid)
  name: string;
  email: string;
  roleName?: string; // resolved (from doc.roleName or roles map)
  roleId?: string;
};

async function loadRolesMap(): Promise<Record<string, string>> {
  const snap = await adminDb.collection("roles").limit(1000).get();
  const map: Record<string, string> = {};
  snap.forEach((d) => {
    const r = d.data() as any;
    map[d.id] = r?.name ?? "";
  });
  return map;
}

export async function listUsersCore(q?: string): Promise<UserRow[]> {
  // fetch up to N users (tune as needed; switch to cursor/indices for very large sets)
  const snap = await adminDb.collection("users").limit(1000).get();
  const rolesMap = await loadRolesMap();

  let users: UserRow[] = snap.docs.map((d) => {
    const data = d.data() as any;
    const roleId = data?.roleId ?? undefined;
    const roleName = data?.roleName ?? (roleId ? rolesMap[roleId] : undefined);
    return {
      id: d.id,
      name: data?.name ?? "",
      email: data?.email ?? "",
      roleName: roleName || "—",
      roleId,
    };
  });

  if (q && q.trim()) {
    const s = q.trim().toLowerCase();
    users = users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(s) ||
        (u.email ?? "").toLowerCase().includes(s)
    );
  }

  // sort (name, then email) for stable UI
  users.sort((a, b) => {
    const n = (a.name || "").localeCompare(b.name || "");
    return n !== 0 ? n : (a.email || "").localeCompare(b.email || "");
  });

  return users;
}

export async function deleteUserCore(userId: string) {
  if (!userId) throw new Error("Missing userId");

  // Delete Firestore user document
  await adminDb.collection("users").doc(userId).delete();

  // OPTIONAL: also delete from Firebase Auth if doc id == uid
  await adminAuth.deleteUser(userId);

  return { ok: true as const };
}
