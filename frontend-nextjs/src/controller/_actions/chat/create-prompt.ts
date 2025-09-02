// controller/_actions/chat/command/create-prompt.ts
"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/firebase-admin";

import { extractSchema } from "@/controller/_actions/nlq/sql_extractor/extract_schema";
import { buildPromptTemplate } from "@/controller/_actions/nlq/text_to_sql/prompt_template";
import { callAIModel } from "@/controller/_actions/nlq/text_to_sql/openai";
import { extractSqlFromResponse } from "@/controller/_actions/nlq/text_to_sql/extract_sql_response";
import { executeSqlGenerated } from "@/controller/_actions/nlq/text_to_sql/execute_sql_generated";
import {
  logNlqRun,
  logPipelineError,
} from "@/controller/_actions/nlq/nlq-logging";
import { searchWithQuery } from "../nlq/vbd/find-by-prompt";

// ---- DB connection config from env ----
type Supported =
  | "postgres"
  | "mysql"
  | "sqlite"
  | "mariadb"
  | "mssql"
  | "oracle";
function getDbConfig() {
  const type = (process.env.DB_TYPE || "postgres") as Supported;
  return {
    type,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "Passw0rd",
    database: process.env.DB_NAME || "dvdrental",
  } as const;
}

// ---- enforce SELECT-only & add LIMIT if missing ----
function ensureSafeSelect(sqlIn: string): string {
  if (!sqlIn?.trim()) throw new Error("Model did not return SQL.");
  let sql = sqlIn.trim();

  const forbidden =
    /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|merge)\b/i;
  if (forbidden.test(sql))
    throw new Error("Only SELECT statements are allowed.");
  return sql;
}

// ---- get user id from JWT cookie ----
async function getUserIdFromCookie(): Promise<string> {
  try {
    const token = (await cookies()).get("fb_id_token")?.value;
    if (!token) return "anonymous";
    const decoded = await adminAuth.verifyIdToken(token);
    // Prefer JWT "sub", then uid/user_id
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

export async function CreatePrompt({ prompt }: { prompt: string }) {
  const tStart = new Date();
  const userId = await getUserIdFromCookie();
  const dbConfig = getDbConfig();

  let sqlGenerated = "";
  let errorId = "";

  try {
    if (!prompt?.trim()) throw new Error("Question is required.");

    let schema: string;
    try {
      schema = await extractSchema([], dbConfig);
    } catch (err: any) {
      errorId = await logPipelineError("extract_schema", err, { userId });
      throw new Error("Failed to extract database schema.");
    }

    let vbd_similarity = null;
    try {
      vbd_similarity = await searchWithQuery(prompt);
      console.log("VBD similarity results:", vbd_similarity);
    } catch (err: any) {
      errorId = await logPipelineError("embedding", err, { userId });
      throw new Error("Failed to generate prompt embedding.");
    }


    const aiPrompt = buildPromptTemplate({
      user_question: prompt,
      vbd_similarity: vbd_similarity,
      db_type: dbConfig.type,
      physical_db_schema: schema,
    });

    let aiResponse: string;
    try {
      aiResponse = await callAIModel(aiPrompt);
    } catch (err: any) {
      errorId = await logPipelineError("openai_generate", err, { userId });
      throw new Error("Failed to generate SQL from the AI model.");
    }

    try {
      sqlGenerated = ensureSafeSelect(extractSqlFromResponse(aiResponse));
    } catch (err: any) {
      errorId = await logPipelineError("extract_sql", err, {
        userId,
        aiSnippet: aiResponse?.slice(0, 500),
      });
      throw new Error("Failed to extract a valid SELECT statement.");
    }

    let rows: any[] = [];
    try {
      rows = await executeSqlGenerated(sqlGenerated, dbConfig);
    } catch (err: any) {
      errorId = await logPipelineError("execute_sql", err, {
        userId,
        sql: sqlGenerated,
      });
      throw new Error("The generated SQL failed to execute.");
    }

    const tEnd = new Date();
    const nlq_id = await logNlqRun({
      userId,
      question: prompt,
      sql_executed: sqlGenerated,
      error_id: "", // success
      time_question: tStart,
      time_result: tEnd,
      user_feedback_id: "", // no feedback yet
      sql_is_good: true, // ✅ success defaults to true
    });

    return {
      id_prompt: nlq_id, // <-- Firestore id of the run (use this in feedback)
      results: rows,
      error: null as string | null,
    };
  } catch (e: any) {
    const tEnd = new Date();
    await logNlqRun({
      userId,
      question: prompt,
      sql_executed: sqlGenerated || "",
      error_id: errorId || "",
      time_question: tStart,
      time_result: tEnd,
      user_feedback_id: "",
      sql_is_good: false, // ✅ any pipeline error → false
    });

    return {
      id_prompt: null, // keep feedback hidden for error runs
      results: [],
      error: e?.message ?? "Unexpected error",
    };
  }
}
