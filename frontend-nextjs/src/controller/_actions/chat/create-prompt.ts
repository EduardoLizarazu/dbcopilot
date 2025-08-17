"use server";

import { TextToSQLServiceExecution } from "@/controller/_actions/nlq/text_to_sql/text_to_sql";

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

export async function CreatePrompt({ prompt }: { prompt: string }) {
  try {
    const rows = await TextToSQLServiceExecution({
      user_question: prompt,
      config: getDbConfig(),
    });

    // id_prompt is optional here — use timestamp for now
    return {
      id_prompt: Date.now(),
      results: Array.isArray(rows) ? rows : [],
      error: null as string | null,
    };
  } catch (e: any) {
    return {
      id_prompt: null,
      results: [],
      error: e?.message ?? "Failed to execute query",
    };
  }
}
