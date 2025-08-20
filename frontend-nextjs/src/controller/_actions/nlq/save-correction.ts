// controller/_actions/nlq/save-correction.ts
"use server";

import { adminDb, adminAuth } from "@/lib/firebase/firebase-admin";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

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

  // 1) Cargar NLQ (para wrong_sql y question)
  const nlqRef = adminDb.collection("nlq").doc(nlq_id);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) throw new Error("NLQ not found");

  const d = nlqSnap.data() as any;
  const wrong_sql = (d.sql_executed as string) || "";
  const user_question = (d.question as string) || "";
  const corrected_by_user_id = await getUserIdFromCookie();

  // 2) Preparar refs y IDs
  const corrRef = adminDb.collection("nlq_correction").doc(); // id autogen, lo usaremos como id del vector
  const vbdRef = adminDb.collection("vbd").doc();
  const pineconeVectorId = corrRef.id; // usamos el mismo id para Pinecone

  // 3) Generar embedding (OpenAI) del par Pregunta + SQL
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embeddingInput = `Pregunta:\n${user_question}\n\nSQL:\n${corrected_sql}`;
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small", // o text-embedding-3-large si quieres mayor calidad
    input: embeddingInput,
  });
  const vector = emb.data?.[0]?.embedding;
  if (!vector || !Array.isArray(vector)) {
    throw new Error("No se pudo generar el embedding para Pinecone.");
  }

  // 4) Upsert en Pinecone
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX!);
  const target = process.env.PINECONE_NAMESPACE
    ? index.namespace(process.env.PINECONE_NAMESPACE)
    : index;

  await target.upsert([
    {
      id: pineconeVectorId,
      values: vector,
      metadata: {
        question: user_question,
        corrected_sql,
        createdAt: new Date().toISOString(),
      },
    },
  ]);

  // 5) Commit Firestore en batch (corrección, nlq, vbd)
  const batch = adminDb.batch();

  // 5.1 Guardar corrección
  batch.set(corrRef, {
    nlq_id,
    wrong_sql,
    corrected_sql,
    user_question,
    corrected_by_user_id,
    createdAt: new Date(),
  });

  // 5.2 Actualizar NLQ: marcar bueno + enlazar nlq_correction_id
  batch.set(
    nlqRef,
    { sql_is_good: true, nlq_correction_id: corrRef.id },
    { merge: true }
  );

  // 5.3 Crear registro en VBD con la ubicación en Pinecone
  batch.set(vbdRef, {
    nlq_id: [nlq_id],
    vbd_location_id: pineconeVectorId, // << id del vector en Pinecone
    general_query: "",
    general_question: "",
    createdAt: new Date(),
  });

  await batch.commit();

  return {
    ok: true as const,
    correction_id: corrRef.id,
    vbd_id: vbdRef.id,
    vbd_location_id: pineconeVectorId,
  };
}
