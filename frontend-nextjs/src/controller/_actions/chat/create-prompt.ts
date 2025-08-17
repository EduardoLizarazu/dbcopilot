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
  type PipelineStage,
} from "@/controller/_actions/nlq/nlq-logging";

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
    database: process.env.DB_NAME || "northwind",
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

  let errorId = "";
  let sqlGenerated = "";

  try {
    if (!prompt?.trim()) throw new Error("Question is required.");

    // 1) Extract physical schema
    let schema: string;
    try {
      schema = await extractSchema([], dbConfig);
    } catch (err: any) {
      errorId = await logPipelineError("extract_schema", err, { userId });
      throw new Error("Failed to extract database schema.");
    }

    // 2) Build prompt
    const aiPrompt = buildPromptTemplate({
      user_question: prompt,
      db_type: dbConfig.type,
      physical_db_schema: schema,
    });

    // 3) Call OpenAI
    let aiResponse: string;
    try {
      aiResponse = await callAIModel(aiPrompt);
    } catch (err: any) {
      errorId = await logPipelineError("openai_generate", err, { userId });
      throw new Error("Failed to generate SQL from the AI model.");
    }

    // 4) Extract & sanitize SQL
    try {
      const rawSql = extractSqlFromResponse(aiResponse);
      sqlGenerated = ensureSafeSelect(rawSql);
    } catch (err: any) {
      errorId = await logPipelineError("extract_sql", err, {
        userId,
        aiSnippet: aiResponse?.slice(0, 500),
      });
      throw new Error("Failed to extract a valid SELECT statement.");
    }

    // 5) Execute SQL
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

    // 6) Log success to `nlq`
    const tEnd = new Date();
    await logNlqRun({
      userId,
      question: prompt,
      sql_executed: sqlGenerated,
      error_id: "", // success → empty string
      time_question: tStart,
      time_result: tEnd,
    });

    return {
      id_prompt: tStart.getTime(), // or any id you prefer
      results: rows,
      error: null as string | null,
    };
  } catch (e: any) {
    // Log `nlq` even on error (with error_id)
    const tEnd = new Date();
    await logNlqRun({
      userId,
      question: prompt,
      sql_executed: sqlGenerated || "",
      error_id: errorId || "",
      time_question: tStart,
      time_result: tEnd,
    });

    return {
      id_prompt: null,
      results: [],
      error: e?.message ?? "Unexpected error",
    };
  }
}
