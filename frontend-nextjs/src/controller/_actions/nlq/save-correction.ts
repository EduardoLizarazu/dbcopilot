// controller/_actions/nlq/save-correction.ts
"use server";

import { adminDb, adminAuth } from "@/lib/firebase/firebase-admin";
import { cookies } from "next/headers";

async function getUserIdFromCookie(): Promise<string> {
  try {
    const token = (await cookies()).get("fb_id_token")?.value;
    if (!token) return "anonymous";
    const decoded = await adminAuth.verifyIdToken(token);
    return (
      (decoded as any).sub ||
      decoded.uid ||
      (decoded as any).user_id ||
      "anonymous"
    );
  } catch {
    return "anonymous";
  }
}

export async function saveNlqCorrectionAction(params: {
  nlq_id: string;
  corrected_sql: string;
}) {
  const { nlq_id, corrected_sql } = params;
  if (!nlq_id?.trim()) throw new Error("nlq_id required");
  if (!corrected_sql?.trim()) throw new Error("corrected_sql required");

  // Load NLQ for wrong_sql + question
  const nlqRef = adminDb.collection("nlq").doc(nlq_id);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) throw new Error("NLQ not found");

  const d = nlqSnap.data() as any;
  const wrong_sql = (d.sql_executed as string) || "";
  const user_question = (d.question as string) || "";
  const corrected_by_user_id = await getUserIdFromCookie();

  // Save correction (collection name kept as "nlq_correction")
  const corrRef = await adminDb.collection("nlq_correction").add({
    nlq_id,
    wrong_sql,
    corrected_sql,
    user_question,
    corrected_by_user_id, // ✅ who corrected
    createdAt: new Date(),
  });

  // Mark NLQ as good
  await nlqRef.set({ sql_is_good: true }, { merge: true });

  return { ok: true as const, correction_id: corrRef.id };
}
