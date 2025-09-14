"use server";

import {
  adminDb,
  adminAuth,
} from "@/infrastructure/providers/firebase/firebase-admin";

export type NlqCorrectionItem = {
  id: string;
  userId: string;
  email: string;
  question: string;
  sql_executed: string;
  user_feedback_id: string; // "" if none
  feedback_type: -1 | 0 | 1; // -1=no feedback
  feedback_explanation: string; // "" if none
  error_id: string; // "" if none
  time_question: string | null; // ISO
};

export type ListCorrectionsFilters = {
  emailContains?: string;
  tqFrom?: string; // ISO/datetime-local
  tqTo?: string; // ISO/datetime-local
  kind?: "all" | "feedback" | "error"; // filter between feedback vs exec error
  limit?: number; // default 200
};

// ---- helpers ----
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
function toIsoOrNull(v: any): string | null {
  const d = toDateOrNull(v);
  return d ? d.toISOString() : null;
}

export async function listNlqCorrectionsAction(
  filters: ListCorrectionsFilters
): Promise<NlqCorrectionItem[]> {
  const {
    emailContains = "",
    tqFrom,
    tqTo,
    kind = "all",
    limit = 200,
  } = filters || {};

  const tqFromDate = tqFrom ? toDateOrNull(tqFrom) : null;
  const tqToDate = tqTo ? toDateOrNull(tqTo) : null;

  // Base: only bad runs; NO orderBy to avoid composite index
  const baseSnap = await adminDb
    .collection("nlq")
    .where("sql_is_good", "==", false)
    .limit(Math.max(limit, 500))
    .get();

  const rawAll = baseSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

  // In-memory range on time_question
  const byTq = rawAll.filter((r) => {
    const tq = toDateOrNull(r.time_question);
    if (tqFromDate && (!tq || tq < tqFromDate)) return false;
    if (tqToDate && (!tq || tq > tqToDate)) return false;
    return true;
  });

  // kind filter: feedback / error
  const byKind = byTq.filter((r) => {
    const hasFb =
      typeof r.user_feedback_id === "string" && r.user_feedback_id.length > 0;
    const hasErr = typeof r.error_id === "string" && r.error_id.length > 0;
    if (kind === "feedback") return hasFb;
    if (kind === "error") return hasErr;
    return true; // all
  });

  // Resolve emails
  const userIds = Array.from(
    new Set(byKind.map((r) => r.userId).filter(Boolean))
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

  // Pull feedback docs (type + explanation)
  const fbIds = byKind
    .map((r) =>
      typeof r.user_feedback_id === "string" ? r.user_feedback_id : ""
    )
    .filter(Boolean);
  let feedbackTypeMap = new Map<string, 0 | 1>();
  let feedbackMsgMap = new Map<string, string>();
  if (fbIds.length) {
    const refs = fbIds.map((id) => adminDb.collection("feedback").doc(id));
    const docs = await adminDb.getAll(...refs);
    docs.forEach((snap) => {
      if (!snap.exists) return;
      const d = snap.data() as any;
      feedbackTypeMap.set(snap.id, (d?.type as 0 | 1) ?? (-1 as any));
      feedbackMsgMap.set(snap.id, (d?.explanation as string) || "");
    });
  }

  // Email search (case-insensitive)
  const needle = emailContains.trim().toLowerCase();
  const filtered = byKind.filter((r) => {
    if (!needle) return true;
    return (emailMap.get(r.userId) || "").toLowerCase().includes(needle);
  });

  // Sort newest first (client-friendly, no index needed)
  filtered.sort((a, b) => {
    const ad = toDateOrNull(a.time_question)?.getTime() ?? 0;
    const bd = toDateOrNull(b.time_question)?.getTime() ?? 0;
    return bd - ad;
  });

  // Build rows
  const out: NlqCorrectionItem[] = filtered.slice(0, limit).map((r) => {
    const fbId =
      typeof r.user_feedback_id === "string" ? r.user_feedback_id : "";
    return {
      id: r.id,
      userId: r.userId || "",
      email: emailMap.get(r.userId) || "",
      question: r.question || "",
      sql_executed: r.sql_executed || "",
      user_feedback_id: fbId,
      feedback_type: fbId ? (feedbackTypeMap.get(fbId) ?? -1) : -1,
      feedback_explanation: fbId ? feedbackMsgMap.get(fbId) || "" : "",
      error_id: (typeof r.error_id === "string" ? r.error_id : "") || "",
      time_question: toIsoOrNull(r.time_question),
    };
  });

  return out;
}
