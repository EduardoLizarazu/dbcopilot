// controller/_actions/nlq/list.ts
"use server";

import {
  adminDb,
  adminAuth,
} from "@/infrastructure/providers/firebase/firebase-admin";

export type NlqHistoryItem = {
  id: string;
  userId: string;
  email: string;
  question: string;
  sql_executed: string;
  sql_is_good: boolean;
  user_feedback_id: string; // "" if none
  feedback_type: -1 | 0 | 1; // -1=no feedback
  user_deletion: boolean;
  time_question: string | null; // ISO
  time_result: string | null; // ISO
};

export type ListFilters = {
  emailContains?: string;
  tqFrom?: string; // ISO string from UI
  tqTo?: string;
  trFrom?: string;
  trTo?: string;
  includeDeleted?: boolean;
  limit?: number;
};

// ---- helpers ----
function toDateOrNull(v: any): Date | null {
  if (!v) return null;
  // Firestore Timestamp
  if (typeof v.toDate === "function") {
    try {
      return v.toDate();
    } catch {
      /* ignore */
    }
  }
  // Plain object with seconds/nanoseconds
  if (typeof v === "object" && ("seconds" in v || "_seconds" in v)) {
    const sec = (v.seconds ?? v._seconds) as number;
    const nsec = (v.nanoseconds ?? v._nanoseconds ?? 0) as number;
    return new Date(sec * 1000 + Math.floor(nsec / 1e6));
  }
  // String/Date/number
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function toIsoOrNull(v: any): string | null {
  const d = toDateOrNull(v);
  return d ? d.toISOString() : null;
}

export async function listNlqHistoryAction(
  filters: ListFilters
): Promise<NlqHistoryItem[]> {
  const {
    emailContains = "",
    tqFrom,
    tqTo,
    trFrom,
    trTo,
    includeDeleted = true,
    limit = 200,
  } = filters || {};

  const tqFromDate = tqFrom ? toDateOrNull(tqFrom) : null;
  const tqToDate = tqTo ? toDateOrNull(tqTo) : null;
  const trFromDate = trFrom ? toDateOrNull(trFrom) : null;
  const trToDate = trTo ? toDateOrNull(trTo) : null;

  // Base query: order by time_question desc
  let q = adminDb
    .collection("nlq")
    .orderBy("time_question", "desc")
    .limit(limit);

  // Add range filters on time_question only if valid
  if (tqFromDate) q = q.where("time_question", ">=", tqFromDate);
  if (tqToDate) q = q.where("time_question", "<=", tqToDate);

  const snap = await q.get();
  const raw = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

  // Hide deleted unless requested
  //   const notDeleted = includeDeleted ? raw : raw.filter((r) => !r.user_deletion);

  // Filter by time_result in-memory (avoid composite index)
  const byTr = raw.filter((r) => {
    if (!trFromDate && !trToDate) return true;
    const tr = toDateOrNull(r.time_result);
    if (trFromDate && (!tr || tr < trFromDate)) return false;
    if (trToDate && (!tr || tr > trToDate)) return false;
    return true;
  });

  // Resolve emails
  const userIds = Array.from(
    new Set(byTr.map((r) => r.userId).filter(Boolean))
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

  // Feedback types
  const fbIds = byTr
    .map((r) =>
      typeof r.user_feedback_id === "string" ? r.user_feedback_id : ""
    )
    .filter(Boolean);
  let feedbackMap = new Map<string, 0 | 1>();
  if (fbIds.length) {
    const refs = fbIds.map((id) => adminDb.collection("feedback").doc(id));
    const docs = await adminDb.getAll(...refs);
    feedbackMap = new Map(
      docs
        .filter((s) => s.exists)
        .map((s) => [s.id, (s.data()?.type as 0 | 1) ?? (-1 as any)])
    );
  }

  // Email search (case-insensitive)
  const needle = emailContains.trim().toLowerCase();
  const filtered = byTr.filter((r) => {
    if (!needle) return true;
    return (emailMap.get(r.userId) || "").toLowerCase().includes(needle);
  });

  // Build result safely converting timestamps
  const out: NlqHistoryItem[] = filtered.map((r) => ({
    id: r.id,
    userId: r.userId || "",
    email: emailMap.get(r.userId) || "",
    question: r.question || "",
    sql_executed: r.sql_executed || "",
    sql_is_good: Boolean(r.sql_is_good),
    user_feedback_id:
      typeof r.user_feedback_id === "string" ? r.user_feedback_id : "",
    feedback_type: r.user_feedback_id
      ? (feedbackMap.get(r.user_feedback_id) ?? -1)
      : -1,
    user_deletion: Boolean(r.user_deletion),
    time_question: toIsoOrNull(r.time_question),
    time_result: toIsoOrNull(r.time_result),
  }));

  return out;
}
