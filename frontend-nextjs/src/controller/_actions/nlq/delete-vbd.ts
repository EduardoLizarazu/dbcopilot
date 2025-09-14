"use server";

import { adminDb } from "@/infrastructure/providers/firebase/firebase-admin";
import { Pinecone } from "@pinecone-database/pinecone";

export async function deleteNlqVbdAction(nlqId: string) {
  if (!nlqId) throw new Error("nlqId is required");

  const nlqRef = adminDb.collection("nlq").doc(nlqId);
  const nlqSnap = await nlqRef.get();
  if (!nlqSnap.exists) throw new Error("NLQ not found");

  const nlq = nlqSnap.data() as any;
  const vbdId: string = (nlq?.nlq_vbd_id as string) || "";
  if (!vbdId)
    throw new Error("This NLQ is not uploaded to VBD (nlq_vbd_id is empty).");

  const vbdRef = adminDb.collection("vbd").doc(vbdId);
  const vbdSnap = await vbdRef.get();
  if (!vbdSnap.exists) {
    // Si el VBD no existe, solo limpia el nlq
    await nlqRef.set({ nlq_vbd_id: "" }, { merge: true });
    return { ok: true, clearedOnly: true };
  }

  const vbd = vbdSnap.data() as any;
  const vectorId: string = (vbd?.vbd_location_id as string) || "";

  // 1) Borrar en Pinecone (si hay vector)
  if (vectorId) {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index(process.env.PINECONE_INDEX!);
    const target = process.env.PINECONE_NAMESPACE
      ? index.namespace(process.env.PINECONE_NAMESPACE)
      : index;

    // SDK v2: deleteOne; alternativamente: await target.delete({ ids: [vectorId] })
    (await (target as any).deleteOne)
      ? await (target as any).deleteOne(vectorId)
      : await target.deleteMany({ ids: [vectorId] });
  }

  // 2) Borrar doc VBD y limpiar nlq.nlq_vbd_id
  const batch = adminDb.batch();
  batch.delete(vbdRef);
  batch.set(nlqRef, { nlq_vbd_id: "" }, { merge: true });
  await batch.commit();

  return { ok: true, clearedOnly: false };
}
