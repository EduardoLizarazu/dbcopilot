import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";
import { adminAuth } from "@/infrastructure/providers/firebase/firebase-admin";

export type UserRow = {
  id: string; // Firestore doc id (ideally the uid)
  name: string;
  lastname?: string;
  email: string;
  roleIds: string[]; // single source of truth
  roleNames: string; // computed, comma-separated for UI
};

async function loadRolesMap(): Promise<Record<string, string>> {
  const snap = await adminDb.collection("roles").limit(2000).get();
  const map: Record<string, string> = {};
  snap.forEach((d) => {
    const r = d.data() as any;
    map[d.id] = r?.name ?? "";
  });
  return map;
}

export async function listUsersCore(q?: string): Promise<UserRow[]> {
  const [usersSnap, rolesMap] = await Promise.all([
    adminDb.collection("users").limit(2000).get(),
    loadRolesMap(),
  ]);

  let users: UserRow[] = usersSnap.docs.map((d) => {
    const data = d.data() as any;
    const roleIds: string[] = Array.isArray(data?.roleIds) ? data.roleIds : [];
    const names = roleIds.map((rid) => rolesMap[rid]).filter(Boolean);
    return {
      id: d.id,
      name: data?.name ?? "",
      lastname: data?.lastname ?? "",
      email: data?.email ?? "",
      roleIds,
      roleNames: names.length ? names.join(", ") : "—",
    };
  });

  if (q && q.trim()) {
    const s = q.trim().toLowerCase();
    users = users.filter(
      (u) =>
        (u.name ?? "").toLowerCase().includes(s) ||
        (u.lastname ?? "").toLowerCase().includes(s) ||
        (u.email ?? "").toLowerCase().includes(s)
    );
  }

  users.sort((a, b) => {
    const n = (a.name || "").localeCompare(b.name || "");
    if (n !== 0) return n;
    return (a.email || "").localeCompare(b.email || "");
  });

  return users;
}

export async function deleteUserCore(userId: string) {
  if (!userId) throw new Error("Missing userId");
  await adminDb.collection("users").doc(userId).delete();

  // Optional: also remove from Firebase Auth if doc id == uid
  await adminAuth.deleteUser(userId);

  return { ok: true as const };
}
