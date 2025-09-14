// controller/_actions/nlq/create-admin.ts
"use server";

import {
  adminDb,
  adminAuth,
} from "@/infrastructure/providers/firebase/firebase-admin";
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

export async function createNlqAdminAction(params: {
  question: string;
  sql: string;
}) {
  const { question, sql } = params;
  if (!question?.trim()) throw new Error("Question is required.");
  if (!sql?.trim()) throw new Error("SQL is required.");

  // Prepare IDs (don’t write yet)
  const nlqRef = adminDb.collection("nlq").doc();
  const vbdRef = adminDb.collection("vbd").doc();
  const userId = await getUserIdFromCookie();

  // 1) Build embedding (OpenAI)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const input = `Pregunta:\n${question}\n\nSQL:\n${sql}`;
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  const vector = emb.data?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error("Embedding generation failed.");

  // 2) Upsert to Pinecone (vector id = VBD doc id)
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX!);
  const target = process.env.PINECONE_NAMESPACE
    ? index.namespace(process.env.PINECONE_NAMESPACE)
    : index;

  await target.upsert([
    {
      id: vbdRef.id,
      values: vector,
      metadata: {
        nlq_id: nlqRef.id,
        question,
        sql,
        general_query: "",
        general_question: "",
        createdAt: new Date().toISOString(),
        created_by: userId,
      },
    },
  ]);

  // 3) Commit Firestore (batch): NLQ + VBD
  const now = new Date();
  const batch = adminDb.batch();

  batch.set(nlqRef, {
    question,
    sql_executed: sql,
    sql_is_good: true, // it ran OK before saving
    admin_creation: true, // as requested
    userId, // who created
    time_question: now,
    time_result: now,
    nlq_vbd_id: vbdRef.id, // link to VBD
  });

  batch.set(vbdRef, {
    nlq_id: [nlqRef.id],
    vbd_location_id: vbdRef.id,
    general_query: "",
    general_question: "",
    createdAt: now,
  });

  await batch.commit();

  return { ok: true as const, nlq_id: nlqRef.id, vbd_id: vbdRef.id };
}
