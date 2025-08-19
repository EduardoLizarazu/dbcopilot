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
