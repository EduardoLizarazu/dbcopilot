// controller/_actions/nlq/list-good.ts
"use server";

import { adminDb, adminAuth } from "@/lib/firebase/firebase-admin";

export type NlqGoodItem = {
  id: string;
  userId: string;
  email: string;
  question: string;
  nlq_vbd_id: string; // "" if none
  uploaded: boolean; // nlq_vbd_id !== ""
  vbd_created_at: string | null; // ISO or null
};

function toDateOrNull(v: any): Date | null {
  if (!v) return null;
  if (typeof v.toDate === "function") {
    try {
      return v.toDate();
    } catch {}
  }
  if (typeof v === "object" && ("seconds" in v || "_seconds" in v)) {
    const sec = (v.seconds ?? (v as any)._seconds) as number;
    const nsec = (v.nanoseconds ?? (v as any)._nanoseconds ?? 0) as number;
    return new Date(sec * 1000 + Math.floor(nsec / 1e6));
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
const toIso = (v: any) => {
  const d = toDateOrNull(v);
  return d ? d.toISOString() : null;
};

export async function listNlqGoodAction(limit = 300): Promise<NlqGoodItem[]> {
  const snap = await adminDb
    .collection("nlq")
    .where("sql_is_good", "==", true)
    .limit(limit)
    .get();

  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

  // Resolve emails
  const userIds = Array.from(
    new Set(rows.map((r) => r.userId).filter(Boolean))
  );
  const emailMap = new Map<string, string>();
  await Promise.all(
    userIds.map(async (uid) => {
      try {
        const u = await adminAuth.getUser(uid);
        emailMap.set(uid, u.email || "");
      } catch {
        emailMap.set(uid, "");
      }
    })
  );

  // Fetch VBD docs to get createdAt
  const vbdIds = rows
    .map((r) => (typeof r.nlq_vbd_id === "string" ? r.nlq_vbd_id : ""))
    .filter(Boolean);
  let vbdCreatedAtMap = new Map<string, string | null>();
  if (vbdIds.length) {
    const refs = vbdIds.map((id) => adminDb.collection("vbd").doc(id));
    const docs = await adminDb.getAll(...refs);
    docs.forEach((s) => {
      if (!s.exists) return;
      vbdCreatedAtMap.set(s.id, toIso((s.data() as any)?.createdAt));
    });
  }

  return rows.map((r) => {
    const nlq_vbd_id =
      (typeof r.nlq_vbd_id === "string" ? r.nlq_vbd_id : "") || "";
    return {
      id: r.id,
      userId: r.userId || "",
      email: emailMap.get(r.userId) || "",
      question: r.question || "",
      nlq_vbd_id,
      uploaded: nlq_vbd_id !== "",
      vbd_created_at: nlq_vbd_id
        ? (vbdCreatedAtMap.get(nlq_vbd_id) ?? null)
        : null,
    };
  });
}
