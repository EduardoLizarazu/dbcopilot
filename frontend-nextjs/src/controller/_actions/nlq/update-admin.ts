// controller/_actions/nlq/update-admin.ts
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

export async function updateNlqAdminAction(params: {
  nlqId: string;
  question: string;
  sql: string;
}) {
  const { nlqId, question, sql } = params;
  if (!nlqId) throw new Error("nlqId required");
  if (!question?.trim()) throw new Error("Question is required.");
  if (!sql?.trim()) throw new Error("SQL is required.");

  // Load NLQ & (optional) VBD
  const nlqRef = adminDb.collection("nlq").doc(nlqId);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) throw new Error("NLQ not found");
  const nlq = nlqSnap.data() as any;

  const oldVbdId: string =
    (typeof nlq.nlq_vbd_id === "string" ? nlq.nlq_vbd_id : "") || "";

  // Delete previous VBD + Pinecone vector (if any)
  if (oldVbdId) {
    const vbdRef = adminDb.collection("vbd").doc(oldVbdId);
    const vbdSnap = await vbdRef.get();
    if (vbdSnap.exists) {
      const vbd = vbdSnap.data() as any;
      const vectorId: string = (vbd?.vbd_location_id as string) || "";

      if (vectorId) {
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        const index = pc.index(process.env.PINECONE_INDEX!);
        const target = process.env.PINECONE_NAMESPACE
          ? index.namespace(process.env.PINECONE_NAMESPACE)
          : index;

        // v2 compatibility: deleteOne if available; else delete({ids})
        (await (target as any).deleteOne)
          ? await (target as any).deleteOne(vectorId)
          : await target.deleteMany({ ids: [vectorId] });
      }
      await vbdRef.delete();
    }
  }

  // Create new embedding for updated (question, sql)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const input = `Pregunta:\n${question}\n\nSQL:\n${sql}`;
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  const vector = emb.data?.[0]?.embedding;
  if (!Array.isArray(vector)) throw new Error("Embedding generation failed.");

  // Upsert new vector → new VBD doc
  const vbdRef = adminDb.collection("vbd").doc();
  const vectorId = vbdRef.id;

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pc.index(process.env.PINECONE_INDEX!);
  const target = process.env.PINECONE_NAMESPACE
    ? index.namespace(process.env.PINECONE_NAMESPACE)
    : index;

  await target.upsert([
    {
      id: vectorId,
      values: vector,
      metadata: {
        nlq_id: nlqId,
        question,
        sql,
        general_query: "",
        general_question: "",
        createdAt: new Date().toISOString(),
      },
    },
  ]);

  // Update NLQ with new values
  const now = new Date();
  const user_id_update = await getUserIdFromCookie();

  const batch = adminDb.batch();
  batch.set(vbdRef, {
    nlq_id: [nlqId],
    vbd_location_id: vectorId,
    general_query: "",
    general_question: "",
    createdAt: now,
  });
  batch.set(
    nlqRef,
    {
      question,
      sql_executed: sql,
      sql_is_good: true, // validated by running before save
      nlq_vbd_id: vbdRef.id, // link new VBD
      time_question: now,
      time_result: now,
      updatedAt: now,
      user_id_update,
    },
    { merge: true }
  );
  await batch.commit();

  return { ok: true as const, vbd_id: vbdRef.id };
}
