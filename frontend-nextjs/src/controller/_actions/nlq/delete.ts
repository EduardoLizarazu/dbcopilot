// controller/_actions/nlq/delete.ts
"use server";

import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";

export async function deleteNlqCascadeAction(nlqId: string) {
  if (!nlqId) throw new Error("nlqId is required.");

  const nlqRef = adminDb.collection("nlq").doc(nlqId);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) return { ok: true };

  const data = nlqSnap.data() as any;
  const batch = adminDb.batch();

  // Delete linked feedback (by id and any strays by nlq_id)
  const feedbackId = (data?.user_feedback_id as string) || "";
  if (feedbackId) {
    batch.delete(adminDb.collection("feedback").doc(feedbackId));
  } else {
    const strayFb = await adminDb
      .collection("feedback")
      .where("nlq_id", "==", nlqId)
      .get();
    strayFb.forEach((d) => batch.delete(d.ref));
  }

  // Delete linked error
  const errorId = (data?.error_id as string) || "";
  if (errorId) batch.delete(adminDb.collection("errors").doc(errorId));

  // HARD DELETE the NLQ doc itself
  batch.delete(nlqRef);

  await batch.commit();
  return { ok: true as const };
}
