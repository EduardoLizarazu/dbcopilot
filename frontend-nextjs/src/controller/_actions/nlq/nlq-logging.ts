// lib/nlq-logging.ts
import { adminDb } from "@/lib/firebase/firebase-admin";

export type PipelineStage =
  | "extract_schema"
  | "openai_generate"
  | "extract_sql"
  | "execute_sql"
  | "unknown";

/** Write an error to the `errors` collection and return the new doc id */
export async function logPipelineError(
  stage: PipelineStage,
  err: any,
  meta?: Record<string, any>
): Promise<string> {
  const doc = {
    stage,
    message: err?.message ?? String(err),
    stack: err?.stack ?? null,
    meta: meta ?? null,
    createdAt: new Date(),
  };
  const ref = await adminDb.collection("errors").add(doc);
  return ref.id;
}

/** Write the NLQ run to the `nlq` collection */
export async function logNlqRun(params: {
  userId: string;
  question: string;
  sql_executed: string;
  error_id: string; // "" when no error
  time_question: Date;
  time_result: Date;
}) {
  await adminDb.collection("nlq").add({
    ...params,
  });
}
