// controller/_actions/chat/command/submit-feedback.ts
"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";
import {
  attachFeedbackToNlq,
  updateNlqSqlIsGood,
} from "@/controller/_actions/nlq/nlq-logging";

export async function SubmitFeedbackAction(params: {
  nlq_id: string;
  type: 0 | 1; // 0=negative, 1=positive
  explanation?: string; // required if type=0
}) {
  const { nlq_id, type } = params;
  const explanation = (params.explanation ?? "").trim();

  if (!nlq_id) throw new Error("nlq_id is required.");
  if (type !== 0 && type !== 1) throw new Error("type must be 0 or 1.");
  if (type === 0 && !explanation)
    throw new Error("Explanation is required for negative feedback.");

  // Ensure run exists
  const runRef = adminDb.collection("nlq").doc(nlq_id);
  const runSnap = await runRef.get();
  if (!runSnap.exists) throw new Error("NLQ run not found.");

  // Create or update feedback
  const existingFeedbackId = runSnap.get("user_feedback_id") || "";
  const payload = {
    nlq_id,
    type,
    explanation: type === 0 ? explanation : "",
    time: new Date(),
  };

  let feedbackId = existingFeedbackId;
  if (feedbackId) {
    await adminDb
      .collection("feedback")
      .doc(feedbackId)
      .set(payload, { merge: true });
  } else {
    const fRef = await adminDb.collection("feedback").add(payload);
    feedbackId = fRef.id;
    await attachFeedbackToNlq(nlq_id, feedbackId);
  }

  // ✅ If negative feedback, mark run as not good
  if (type === 0) {
    await updateNlqSqlIsGood(nlq_id, false);
  }

  return { ok: true as const, feedback_id: feedbackId };
}
