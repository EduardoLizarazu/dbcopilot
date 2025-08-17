import { log } from "console";
import { extractSchema } from "../sql_extractor/extract_schema";
import { executeSqlGenerated } from "./execute_sql_generated";
import { extractSqlFromResponse } from "./extract_sql_response";
import { callAIModel } from "./openai";
import { buildPromptTemplate } from "./prompt_template";

export type SqlGenerationParams = {
  user_question: string;
  config: {
    type: "postgres" | "mysql" | "sqlite" | "mariadb" | "mssql" | "oracle";
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
};

function ensureSafeSelect(sqlIn: string): string {
  if (!sqlIn?.trim()) throw new Error("Model did not return SQL.");
  let sql = sqlIn.trim();

  // Only allow SELECT
  const forbidden =
    /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|merge)\b/i;
  if (forbidden.test(sql))
    throw new Error("Only SELECT statements are allowed.");

  return sql;
}

export async function TextToSQLServiceExecution(
  params: SqlGenerationParams
): Promise<any[]> {
  // 1) Extract the physical schema
  const physical_db_schema: string = await extractSchema([], params.config);

  console.log("Physical DB Schema:", physical_db_schema);

  // 2) Prompt
  const prompt = buildPromptTemplate({
    user_question: params.user_question,
    db_type: params.config.type,
    physical_db_schema,
  });

  console.log("Final Prompt to AI:", prompt);

  // 3) Call OpenAI
  const aiResponse = await callAIModel(prompt);

  console.log("AI Response: ", aiResponse);

  // 4) Extract & sanitize SQL
  const rawSql = extractSqlFromResponse(aiResponse);

  console.log("Extracted SQL: ", rawSql);

  // const rawSql = `SELECT * FROM customers;`; // Placeholder for testing
  const safeSql = ensureSafeSelect(rawSql);

  console.log("Sanitized SQL:", safeSql);

  // 5) Execute and return rows
  const rows = await executeSqlGenerated(safeSql, params.config);

  console.log("Query Result: ", rows);

  return rows;
}
