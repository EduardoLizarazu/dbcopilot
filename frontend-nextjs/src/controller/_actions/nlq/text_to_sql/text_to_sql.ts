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

export async function TextToSQLServiceExecution(
  params: SqlGenerationParams
): Promise<string> {
  // 1. Extract the physical schema
  const physical_db_schema: string = await extractSchema([], params.config);

  // 1. Build the prompt template
  const prompt = buildPromptTemplate({
    user_question: params.user_question,
    db_type: params.config.type,
    physical_db_schema,
  });

  // 2. Get AI response
  const aiResponse = await callAIModel(prompt);

  // 3. Extract SQL from the response
  const sql = extractSqlFromResponse(aiResponse);

  // 4. Execute the SQL and return results
  return executeSqlGenerated(sql, params.config);
}
