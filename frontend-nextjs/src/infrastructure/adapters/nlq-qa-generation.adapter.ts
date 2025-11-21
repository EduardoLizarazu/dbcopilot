import { TGenNewQuestionQueryFromOldDto } from "@/core/application/dtos/gen-query.dto";
import { TCreateNlqQaGenerationPromptTemplate } from "@/core/application/dtos/nlq/nlq-qa-generation.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";

export class NlqQaGenerationAdapter implements INlqQaQueryGenerationPort {
  constructor(
    private readonly logger: ILogger,
    private readonly aiProvider: OpenAIProvider
  ) {}
  async genNewQuestionAndQuery(
    data: TGenNewQuestionQueryFromOldDto
  ): Promise<{ question: string; query: string }> {
    try {
      this.logger.info(
        `Generating new question and query from previous question: ${data.previousQuestion} and previous query: ${data.previousQuery}`
      );
      const prompt = `
        You are an expert SQL refactoring assistant.

        Your task is to adjust an existing SQL query and its natural-language question according to a set of physical schema changes described in a diff structure.

        ### Previous Question
        ${data.previousQuestion}

        ### Previous SQL Query
        ${data.previousQuery}

        ### Schema Diff (schemaCtxDiff)
        The following JSON describes how the physical schema changed between the version used by the previousQuery and the current version.

        Each node may represent a schema, table, column, or datatype and includes:
        - id / name: the CURRENT physical identifier (after the change).
        - status: numeric change status defined as:
          - 0 = UN_CHANGE (no change)
          - 1 = NEW      (newly added)
          - 2 = DELETE   (deleted / no longer available)
          - 3 = UPDATE   (renamed or otherwise changed)
        - oldId / oldName: the PREVIOUS physical identifier (how it appeared in old queries).
        - newId / newName: may be used to point to the corresponding new identifier when this node represents the old side of a rename.

        Use this diff to understand how to map old physical references to new ones:

        ${data.schemaCtxDiff ? JSON.stringify(data.schemaCtxDiff, null, 2) : "[]"}

        ---

        ### Your Tasks

        1. **Understand the previous intent**  
          Infer what the SQL query was meant to retrieve based on the previousQuestion and previousQuery (business meaning, not just syntax).

        2. **Analyze the schema diff**
          - Identify all schemas, tables, columns, or datatypes with:
            - status = DELETE (2): these objects no longer exist and must not appear in the new SQL.
            - status = UPDATE (3): these objects have changed (typically renamed). Use:
              - oldId/oldName as the way they appeared in the previousQuery.
              - id/newId/newName as the current identifier to be used in the new SQL.
            - status = NEW (1): new objects that may be used only if they are the explicit target of an UPDATE mapping (via newId/newName) or a clearly necessary replacement.
          - Do NOT invent objects or relationships that are not present in the diff or clearly implied by the previousQuery.

        3. **Update the SQL query**
          - Rewrite the previousQuery so that:
            - Any physical reference that matches an oldId/oldName of an UPDATED (status=3) object is replaced with its corresponding current identifier (id or newId/newName).
            - Any reference to a DELETED (status=2) object is removed or the query is simplified accordingly.
          - If removing a deleted object makes the original question impossible to answer, simplify the query to the closest valid approximation (e.g., drop a filter or a column) while keeping the meaning as similar as possible.
          - The final SQL MUST be syntactically valid and consistent with the updated schema implied by schemaCtxDiff.
          - Do NOT create new columns or tables beyond what exists in schemaCtxDiff and the unchanged parts of the original query.
          - Do NOT hallucinate structure: if you cannot confidently map an old reference to a new one via the diff, remove it rather than guessing.

        4. **Update the natural-language question (if needed)**
          - If the schema changes (DELETE/UPDATE) alter what is being returned or filtered (for example, a deleted column that was central to the question), adjust the question minimally so that it:
            - Still describes what the newSQL actually does.
            - Stays as close as possible to the original intent and wording.
          - If the change is purely technical (e.g., column rename without semantic change), keep the question exactly as it was.

        5. **Output Format Requirements**
          Respond ONLY with a JSON object, with no explanations, no markdown, and no backticks.  
          The JSON must have exactly this shape:

          {
            "newQuestion": "string",
            "newSQL": "string"
          }

          - "newQuestion": the final, possibly adjusted natural-language question.
          - "newSQL": the final, updated SQL query.

        6. **Failure case**
          If, after applying the schema diff, you cannot construct any valid SQL that preserves a reasonable version of the original intent, return:

          {
            "newQuestion": "${data.previousQuestion}",
            "newSQL": ""
          }
        `;

      const response = await this.aiProvider.openai.chat.completions.create({
        model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
        messages: [
          {
            role: "system",
            content: `You are an expert SQL refactoring engine specialized in adapting SQL queries and natural language questions after physical schema changes 
            (DELETE or UPDATE). You MUST NOT invent tables or columns. Only use what is present in the updated schema context (schemaCtx) when available.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for deterministic output
        max_tokens: 2000,
        top_p: 0.1,
      });

      const genRes = response.choices[0]?.message?.content?.trim() || "";
      this.logger.info(
        `Received response for new question and query generation: ${genRes}`
      );
      if (!genRes) {
        throw new Error("Empty response from AI provider");
      }
      if (genRes.startsWith("{")) {
        const parsed = JSON.parse(genRes);
        return {
          question: parsed.newQuestion,
          query: parsed.newSQL,
        };
      }
      if (genRes.includes("```")) {
        const codeMatch = genRes.match(/```json([\s\S]*?)```/);
        if (codeMatch && codeMatch[1]) {
          const codeContent = codeMatch[1].trim();
          const parsed = JSON.parse(codeContent);
          return {
            question: parsed.newQuestion,
            query: parsed.newSQL,
          };
        }
      }
      if (genRes.startsWith("json") || genRes.startsWith("JSON")) {
        const jsonStart = genRes.indexOf("{");
        const jsonString = genRes.substring(jsonStart);
        const parsed = JSON.parse(jsonString);
        return {
          question: parsed.newQuestion,
          query: parsed.newSQL,
        };
      }
      throw new Error("Unable to parse AI provider response");
    } catch (error) {
      this.logger.error(
        "NlqQaGenerationAdapter: Error generating new question and query",
        { message: error.message }
      );
      throw new Error(
        error.message || "Error generating new question and query"
      );
    }
  }
  async queryGeneration(prompt: string): Promise<{ answer: string }> {
    try {
      this.logger.info(`Generating query from prompt: ${prompt}`);

      const response = await this.aiProvider.openai.chat.completions.create({
        model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
        messages: [
          {
            role: "system",
            content:
              "You are a SQL expert that generates safe, efficient database queries.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for deterministic output
        max_tokens: 1500,
        top_p: 0.1,
      });

      return { answer: response.choices[0]?.message?.content?.trim() || "" };
    } catch (error) {
      this.logger.error("Error generating query from prompt", { error });
      throw new Error("Error generating query from prompt");
    }
  }
  async createPromptTemplateToGenerateQuery(
    data: TCreateNlqQaGenerationPromptTemplate
  ): Promise<{ promptTemplate: string }> {
    try {
      this.logger.info(
        `[NlqQaGenerationAdapter] Creating prompt template with data: `,
        JSON.stringify(data)
      );
      // Create a prompt template using the provided data
      const template = `
        You are a SQL expert specialized in ${data.dbType} databases. 
        Generate a SELECT query that answers the user's question using ONLY the provided database schema and the help of the similar questions with its sql and score to guide you.

        ### Database Type:
        ${data.dbType}
 
        ### Database Schema ANSI SQL:
        ${JSON.stringify(data.schemaBased)}

        ### User Question:
        ${JSON.stringify(data.question, null, 2)}

        ### Similar Questions with SQL:
        ${JSON.stringify(data.similarKnowledgeBased, null, 2)}

        ### Instructions:
        A) Scope & Validation
        1) Use ONLY the tables and columns present in the provided schema list.
        2) Build an internal map: schema.table -> {columns, datatypes}; validate every referenced column.
        3) Qualify tables as TABLE_SCHEMA.TABLE_NAME and use table aliases; qualify selected/filtered columns.


        B) Dialect: mssql
        5) Use standard T-SQL for SELECT/JOIN/WHERE/ORDER BY. Avoid vendor-specific features from other engines.

        C) Query Construction
        6) Always use explicit JOINs inferred from columns that exist on both sides (e.g., *_ID ↔ ID). Do not invent columns.
        7) Add necessary WHERE clauses implied by the question; respect datatypes (no quoting numerics; use parameters for strings/dates).
        8) Use table aliases; format the query with indentation and line breaks.
        9) When “top/latest/best” is implied, add a deterministic ORDER BY and (if needed) OFFSET … FETCH.
        10) Limit the query to SELECT statements only. Do not generate data-modifying queries.
        11) Answer only the sql query, do not add any explanations and without ";" at the end.
        12) Ignore D_E_L_E_T_E columns in all tables when constructing queries.

        D) Similarity Enforcement (STRICT)
        13) Let similarity_threshold = 0.95:
            - Validate the candidate SQL against the current schema map.
            - If score is greater than similarity_threshold, then, reuse it as-is, do not modify anything, generate it as it is. Do not add anything else!.
            - If score is less than similarity_threshold, then, minimally adapt invalid identifiers or may have to combine multiple similar items; if still invalid, return NOT_ANSWERED.

        E) Output & Fallback
        14) Return ONLY the SQL query, inside a code block, with no extra text and no trailing semicolon.


        ### Response Format, if you know the answer:
        Return ONLY the SQL query inside a code block:
        \`\`\`sql
          SELECT ...
          FROM schema.table AS t
          JOIN schema.other AS o ON ...
          WHERE ...
          ORDER BY ...
        \`\`\`

        ### Response Format, if you don't know the answer:
        \`\`\`NOT_ANSWERED
          I don't know because ...
        \`\`\`

      `;
      this.logger.info(`Created prompt template: ${template}`);

      return { promptTemplate: template };
    } catch (error) {
      this.logger.error(
        "NlqQaGenerationInfraRepository: Error creating prompt template",
        { error }
      );
      throw new Error("Error creating prompt template");
    }
  }
  async extractQueryFromGenerationResponse(
    prompt: string
  ): Promise<{ query: string }> {
    try {
      const sqlMatch = prompt.match(/```sql([\s\S]*?)```/);
      if (sqlMatch && sqlMatch[1]) {
        const sqlQuery = sqlMatch[1].trim();
        this.logger.info(`Extracted SQL query: ${sqlQuery}`);
        return { query: sqlQuery };
      } else {
        this.logger.warn("No SQL query found in the prompt");
        return { query: "" };
      }
    } catch (error) {
      this.logger.error("Error extracting SQL query from prompt", { error });
      throw new Error("Error extracting SQL query from prompt");
    }
  }

  async safeQuery(query: string): Promise<{ query: string; isSafe: boolean }> {
    try {
      // Implement safety checks for the query, e.g., prevent destructive operations or mutations
      const unsafePatterns = [
        /DELETE/i,
        /DROP/i,
        /UPDATE/i,
        /INSERT/i,
        /ALTER/i,
      ];
      const isSafe = !unsafePatterns.some((pattern) => pattern.test(query));
      return { query, isSafe };
    } catch (error) {
      this.logger.error("Error checking query safety", { error });
      throw new Error("Error checking query safety");
    }
  }

  async extractSuggestionsFromGenerationResponse(
    generationResponse: string
  ): Promise<{ suggestion: string }> {
    try {
      const suggestionMatch = generationResponse.match(
        /```NOT_ANSWERED([\s\S]*?)```/
      );
      if (suggestionMatch && suggestionMatch[1]) {
        const suggestion = suggestionMatch[1].trim();
        this.logger.info(`Extracted suggestion: ${suggestion}`);
        return { suggestion };
      } else {
        this.logger.warn("No suggestion found in the generation response");
        return { suggestion: "" };
      }
    } catch (error) {
      this.logger.error(
        "Error extracting suggestion from generation response",
        { error }
      );
      throw new Error("Error extracting suggestion from generation response");
    }
  }
}
