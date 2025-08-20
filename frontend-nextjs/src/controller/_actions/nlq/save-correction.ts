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

  // Cargar NLQ original (para wrong_sql y question)
  const nlqRef = adminDb.collection("nlq").doc(nlq_id);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) throw new Error("NLQ not found");

  const d = nlqSnap.data() as any;
  const wrong_sql = (d.sql_executed as string) || "";
  const user_question = (d.question as string) || "";
  const corrected_by_user_id = await getUserIdFromCookie();

  // Preparar refs para batch
  const corrRef = adminDb.collection("nlq_correction").doc(); // autogen id
  const vbdRef = adminDb.collection("vbd").doc(); // autogen id

  const batch = adminDb.batch();

  // 1) Guardar corrección
  batch.set(corrRef, {
    nlq_id,
    wrong_sql,
    corrected_sql,
    user_question,
    corrected_by_user_id,
    createdAt: new Date(),
  });

  // 2) Actualizar NLQ: marcar bueno + enlazar nlq_correction_id
  batch.set(
    nlqRef,
    { sql_is_good: true, nlq_correction_id: corrRef.id },
    { merge: true }
  );

  // 3) Crear registro en VBD
  batch.set(vbdRef, {
    nlq_id: [nlq_id], // array con el NLQ corregido
    vbd_location_id: "", // por ahora vacío
    general_query: "", // por ahora vacío
    general_question: "", // por ahora vacío
    createdAt: new Date(),
  });

  await batch.commit();

  return { ok: true as const, correction_id: corrRef.id, vbd_id: vbdRef.id };
}
