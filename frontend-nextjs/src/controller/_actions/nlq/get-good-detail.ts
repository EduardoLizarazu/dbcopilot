// controller/_actions/nlq/get-good-detail.ts
"use server";

import { adminDb, adminAuth } from "@/lib/firebase/firebase-admin";

export type NlqGoodDetail = {
  id: string;
  userId: string;
  email: string;
  question: string;
  sql_executed: string;
  sql_is_good: boolean;
  admin_creation: boolean;
  user_deletion: boolean;
  nlq_vbd_id: string; // may be ""
  nlq_correction_id?: string; // if exists
  error_id?: string; // if exists
  error?: { id: string; message?: string } | null;
  feedback?: { id: string; type: -1 | 0 | 1; explanation: string } | null;

  // times
  createdAt?: string | null; // ISO if you store it
  time_question?: string | null;
  time_result?: string | null;
  time_deleted?: string | null;
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

export async function getNlqGoodDetailAction(
  nlqId: string
): Promise<NlqGoodDetail> {
  const ref = adminDb.collection("nlq").doc(nlqId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("NLQ not found");

  const d = snap.data() as any;

  let email = "";
  if (d.userId) {
    try {
      const u = await adminAuth.getUser(d.userId);
      email = u.email || "";
    } catch {}
  }

  // feedback
  let feedback: NlqGoodDetail["feedback"] = null;
  if (typeof d.user_feedback_id === "string" && d.user_feedback_id) {
    const fbSnap = await adminDb
      .collection("feedback")
      .doc(d.user_feedback_id)
      .get();
    if (fbSnap.exists) {
      const fb = fbSnap.data() as any;
      feedback = {
        id: fbSnap.id,
        type: (fb?.type as 0 | 1) ?? -1,
        explanation: (fb?.explanation as string) || "",
      };
    }
  }

  // error
  let error: NlqGoodDetail["error"] = null;
  if (typeof d.error_id === "string" && d.error_id) {
    const errSnap = await adminDb.collection("errors").doc(d.error_id).get();
    if (errSnap.exists) {
      const er = errSnap.data() as any;
      error = { id: errSnap.id, message: er?.message || er?.error || "" };
    }
  }

  return {
    id: nlqId,
    userId: d.userId || "",
    email,
    question: d.question || "",
    sql_executed: d.sql_executed || "",
    sql_is_good: Boolean(d.sql_is_good),
    admin_creation: Boolean(d.admin_creation),
    user_deletion: Boolean(d.user_deletion),
    nlq_vbd_id: (typeof d.nlq_vbd_id === "string" ? d.nlq_vbd_id : "") || "",
    nlq_correction_id:
      typeof d.nlq_correction_id === "string" ? d.nlq_correction_id : undefined,
    error_id: typeof d.error_id === "string" ? d.error_id : undefined,
    error,
    feedback,
    createdAt: toIso(d.createdAt),
    time_question: toIso(d.time_question),
    time_result: toIso(d.time_result),
    time_deleted: toIso(d.time_deleted),
  };
}
