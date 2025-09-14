// controller/_actions/nlq/upload-vbd.ts
"use server";

import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

export async function uploadNlqToVbdAction(params: {
  nlqId: string;
  general_query?: string;
  general_question?: string;
}) {
  const { nlqId, general_query = "", general_question = "" } = params;
  if (!nlqId) throw new Error("nlqId is required");

  // Load NLQ
  const nlqRef = adminDb.collection("nlq").doc(nlqId);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) throw new Error("NLQ not found");

  const nlq = nlqSnap.data() as any;
  if (typeof nlq.nlq_vbd_id === "string" && nlq.nlq_vbd_id) {
    throw new Error("This NLQ is already uploaded to VBD.");
  }

  const question: string = nlq.question || "";
  let sql: string = nlq.sql_executed || "";

  // If there is a correction, prefer corrected_sql
  const correctionId: string = (nlq.nlq_correction_id as string) || "";
  if (correctionId) {
    const corrSnap = await adminDb
      .collection("nlq_correction")
      .doc(correctionId)
      .get();
    if (corrSnap.exists) {
      const corr = corrSnap.data() as any;
      if (corr?.corrected_sql) sql = corr.corrected_sql;
    }
  }
  if (!question || !sql) throw new Error("Missing question or SQL to embed.");

  // Build embedding
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const input = `Pregunta:\n${question}\n\nSQL:\n${sql}`;
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  const vector = emb.data?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error("Embedding generation failed.");

  // Prepare Pinecone + VBD doc
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX!);
  const target = process.env.PINECONE_NAMESPACE
    ? index.namespace(process.env.PINECONE_NAMESPACE)
    : index;

  const vbdRef = adminDb.collection("vbd").doc(); // id = vector id
  const vbdVectorId = vbdRef.id;

  // Upsert vector
  await target.upsert([
    {
      id: vbdVectorId,
      values: vector,
      metadata: {
        nlq_id: nlqId,
        question,
        sql,
        general_query,
        general_question,
        createdAt: new Date().toISOString(),
      },
    },
  ]);

  // Write VBD + link back to NLQ (batch)
  const batch = adminDb.batch();
  batch.set(vbdRef, {
    nlq_id: [nlqId],
    vbd_location_id: vbdVectorId,
    general_query,
    general_question,
    createdAt: new Date(),
  });
  batch.set(nlqRef, { nlq_vbd_id: vbdRef.id }, { merge: true });
  await batch.commit();

  return { ok: true as const, vbd_id: vbdRef.id, vbd_location_id: vbdVectorId };
}
