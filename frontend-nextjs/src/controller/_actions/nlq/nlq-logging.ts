// lib/nlq-logging.ts
import { adminDb } from "@/lib/firebase/firebase-admin";

export type PipelineStage =
  | "extract_schema"
  | "openai_generate"
  | "extract_sql"
  | "execute_sql"
  | "embedding"
  | "unknown";

/** Write an error to the `errors` collection and return the doc id */
export async function logPipelineError(
  stage: PipelineStage,
  err: any,
  meta?: Record<string, any>
): Promise<string> {
  const ref = await adminDb.collection("errors").add({
    stage,
    message: err?.message ?? String(err),
    stack: err?.stack ?? null,
    meta: meta ?? null,
    createdAt: new Date(),
  });
  return ref.id;
}

/** Create an `nlq` document (returns its id) */
export async function logNlqRun(params: {
  userId: string;
  question: string;
  sql_executed: string;
  error_id: string; // "" on success
  time_question: Date;
  time_result: Date;
  user_feedback_id?: string; // default ""
  sql_is_good: boolean; // ✅ new
}): Promise<string> {
  const ref = await adminDb.collection("nlq").add({
    ...params,
    user_feedback_id: params.user_feedback_id ?? "",
    user_deletion: false, // always false by default
  });
  return ref.id;
}

/** Attach/overwrite the feedback id on an `nlq` doc */
export async function attachFeedbackToNlq(nlqId: string, feedbackId: string) {
  await adminDb
    .collection("nlq")
    .doc(nlqId)
    .update({ user_feedback_id: feedbackId });
}

/** Set/overwrite sql_is_good on an `nlq` doc */
export async function updateNlqSqlIsGood(nlqId: string, value: boolean) {
  await adminDb
    .collection("nlq")
    .doc(nlqId)
    .set({ sql_is_good: value }, { merge: true });
}
