"use server";

import { adminDb } from "@/lib/firebase/firebase-admin";

export async function saveNlqCorrectionAction(params: {
  nlq_id: string;
  corrected_sql: string;
}) {
  const { nlq_id, corrected_sql } = params;
  if (!nlq_id?.trim()) throw new Error("nlq_id required");
  if (!corrected_sql?.trim()) throw new Error("corrected_sql required");

  // Load NLQ to get wrong sql + question
  const nlqRef = adminDb.collection("nlq").doc(nlq_id);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) throw new Error("NLQ not found");

  const d = nlqSnap.data() as any;
  const wrong_sql = (d.sql_executed as string) || "";
  const user_question = (d.question as string) || "";

  // Save correction
  const corrRef = await adminDb.collection("nlq_correction").add({
    nlq_id,
    wrong_sql,
    corrected_sql,
    user_question,
    createdAt: new Date(),
  });

  // Mark NLQ as good again
  await nlqRef.set({ sql_is_good: true }, { merge: true });

  return { ok: true as const, correction_id: corrRef.id };
}
