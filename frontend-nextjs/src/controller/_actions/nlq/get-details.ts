"use server";

import { adminDb, adminAuth } from "@/lib/firebase/firebase-admin";

export type NlqDetail = {
  id: string;
  userId: string;
  email: string;
  question: string;
  sql_executed: string;
  feedback?: { type: -1 | 0 | 1; explanation: string; id: string };
  error_id: string;
  time_question?: string | null; // ISO
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

export async function getNlqDetailAction(nlqId: string): Promise<NlqDetail> {
  const ref = adminDb.collection("nlq").doc(nlqId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("NLQ not found");

  const d = snap.data() as any;
  const userId = d.userId || "";
  let email = "";
  try {
    if (userId) {
      const u = await adminAuth.getUser(userId);
      email = u.email || "";
    }
  } catch {
    /* ignore */
  }

  // feedback (optional)
  let feedback: NlqDetail["feedback"] | undefined = undefined;
  const fbId = typeof d.user_feedback_id === "string" ? d.user_feedback_id : "";
  if (fbId) {
    const fb = await adminDb.collection("feedback").doc(fbId).get();
    if (fb.exists) {
      const fbd = fb.data() as any;
      feedback = {
        id: fbId,
        type: (fbd?.type as 0 | 1) ?? -1,
        explanation: (fbd?.explanation as string) || "",
      };
    }
  }

  return {
    id: nlqId,
    userId,
    email,
    question: d.question || "",
    sql_executed: d.sql_executed || "",
    error_id: (d.error_id as string) || "",
    time_question: toIso(d.time_question),
    feedback,
  };
}
