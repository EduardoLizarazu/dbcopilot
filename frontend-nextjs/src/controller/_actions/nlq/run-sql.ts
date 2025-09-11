"use server";

import { executeSqlGenerated } from "@/controller/_actions/nlq/text_to_sql/execute_sql_generated";

type Supported =
  | "postgres"
  | "mysql"
  | "sqlite"
  | "mariadb"
  | "mssql"
  | "oracle";
function getDbConfig() {
  const type = (process.env.ORACLE_TYPE || "oracle") as Supported;
  return {
    type,
    host: process.env.ORACLE_HOST || "",
    port: Number(process.env.ORACLE_PORT || 5432),
    username: process.env.ORACLE_USER || "",
    password: process.env.ORACLE_PASSWORD || "",
    database: process.env.ORACLE_DB_NAME || "",
    sid: process.env.ORACLE_DB_SID || "",
  } as const;
}

function ensureSafeSelect(sqlIn: string): string {
  if (!sqlIn?.trim()) throw new Error("SQL is required.");
  let sql = sqlIn.trim();
  const forbidden =
    /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|merge)\b/i;
  return sql;
}

export async function runSqlAction(sql: string) {
  const safe = ensureSafeSelect(sql);
  const rows = await executeSqlGenerated(safe, getDbConfig());
  return { rows, sql: safe };
}
