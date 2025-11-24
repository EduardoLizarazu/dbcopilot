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

        Your task is to adjust an existing SQL query and its natural-language question according to:
        - a set of physical schema changes described in a diff structure, and
        - an optional extraMessage with additional human hints or constraints.

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

        ### Extra Context (extraMessage)
        You may receive additional hints to help you generate a better, more accurate SQL adaptation.
        This can include things like:
        - Direct rename hints: e.g. "the table X changed to table Y" using full schema.table.column.
        - Case or value adjustments: e.g. "You may have to use this conditional on the WHERE 'PG-13' instead of 'pg-13'".
        - Other clarifications about how to interpret or adapt the query.

        If provided, use this extraMessage as authoritative guidance for:
        - Choosing between multiple plausible mappings.
        - Adjusting constants, filters, or conditions.
        - Resolving ambiguities not fully covered by the diff.

        If extraMessage is not provided, ignore this section.

        Extra message content:

        ${data.extraMessage ? data.extraMessage : "no extraMessage provided"}

        ---

        ### Your Tasks

        1. **Understand the previous intent**  
          Infer what the SQL query was meant to retrieve based on the previousQuestion and previousQuery (business meaning, not just syntax).

        2. **Analyze the schema diff (and extraMessage)**
          - From the schema diff:
            - Identify all schemas, tables, columns, or datatypes with:
              - status = DELETE (2): these objects no longer exist and must not appear in the new SQL.
              - status = UPDATE (3): these objects have changed (typically renamed). Use:
                - oldId/oldName as the way they appeared in the previousQuery.
                - id/newId/newName as the current identifier to be used in the new SQL.
              - status = NEW (1): new objects that may be used only if they are the explicit target of an UPDATE mapping (via newId/newName) or a clearly necessary replacement.
          - From the extraMessage (if present):
            - Apply any explicit mapping instructions (e.g. table/column renames, value normalization in WHERE conditions).
            - Apply any additional conditions or corrections to match the intended logic (e.g. change a literal from 'pg-13' to 'PG-13').
          - Do NOT invent objects or relationships that are not present in:
            - the diff,
            - the unchanged parts of the original query, or
            - the explicit extraMessage.

          In case of conflict:
          - The physical existence of objects (what exists or not) is determined by the schema diff.
          - Naming, filter details, or subtle behavioral hints can be refined by the extraMessage.

        3. **Update the SQL query**
          - Rewrite the previousQuery so that:
            - Any physical reference that matches an oldId/oldName of an UPDATED (status=3) object is replaced with its corresponding current identifier (id or newId/newName).
            - Any reference to a DELETED (status=2) object is removed or the query is simplified accordingly.
            - Any additional mapping or condition described in extraMessage is applied (for example:
              - renaming a table or column using a direct hint,
              - adjusting a WHERE literal from 'pg-13' to 'PG-13',
              - using a specific column instead of another if explicitly instructed).
          - If removing a deleted object makes the original question impossible to answer, simplify the query to the closest valid approximation (e.g., drop a filter or a column) while keeping the meaning as similar as possible.
          - The final SQL MUST be syntactically valid and consistent with the updated schema implied by schemaCtxDiff and any additional constraints given by extraMessage.
          - Do NOT create new columns or tables beyond what exists in:
            - schemaCtxDiff,
            - the unchanged parts of the original query,
            - or what is explicitly indicated in extraMessage.
          - Do NOT hallucinate structure: if you cannot confidently map an old reference to a new one via the diff or extraMessage, remove it rather than guessing.

        4. **Update the natural-language question (if needed)**
          - If the schema changes (DELETE/UPDATE) or extraMessage-driven adjustments alter what is being returned or filtered (for example, a deleted column that was central to the question, or a condition that now behaves differently), adjust the question minimally so that it:
            - Still describes what the newSQL actually does.
            - Stays as close as possible to the original intent and wording.
          - If the change is purely technical (e.g., column rename without semantic change, or case normalization of a filter literal), keep the question exactly as it was.

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
          If, after applying the schema diff and extraMessage, you cannot construct any valid SQL that preserves a reasonable version of the original intent, return:

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
      this.logger.error("Error generating query from prompt", {
        message: error.message,
      });
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
        Your task is to generate a SELECT query that answers the user's question using ONLY the provided database schema and the similar questions with their SQL and score.

        ### Database Type:
        ${data.dbType}

        ### Database Schema ANSI SQL (with metadata):
        ${JSON.stringify(data.schemaBased)}

        ### Schema Format & Semantics
        The schema is an array of schema objects with the following structure:

        - schema.name  = physical schema name in the database
        - table.name   = physical table name in the database
        - column.name  = physical column name in the database

        Use these "name" fields to build fully-qualified identifiers in the SQL query:
        SCHEMA_NAME.TABLE_NAME.COLUMN_NAME

        The "id" field is a helper identifier with the same pattern:
        - schema.id  = "schema_name"
        - table.id   = "schema_name.table_name"
        - column.id  = "schema_name.table_name.column_name"

        You may use "id" to match or reason about elements, but you MUST build SQL identifiers using the corresponding "name" fields.

        The "description" and "aliases" fields are semantic hints:
        - description: human-readable explanation of what the schema/table/column represents.
        - aliases: alternative names/keywords that users might use in questions for this element.
        Use them to map user language to the correct schemas, tables and columns, but NEVER treat them as physical names in the SQL.

        The "profile" object in each column contains:
        - maxValue, minValue, countNulls, countUnique
        - sampleUnique: a sample list of real values from that column.

        Use "profile.sampleUnique" to understand the typical format and values for WHERE conditions (e.g., dates, status codes, etc.), together with the column description.

        ### User Question:
        ${JSON.stringify(data.question, null, 2)}

        ### Similar Questions with SQL (each item has: question, sql, score):
        ${JSON.stringify(data.similarKnowledgeBased, null, 2)}

        ### Instructions:

        A) Scope & Validation
        1) Use ONLY the schemas, tables and columns present in the provided schema list.
        2) Build an internal map: schema.table -> { columns, datatypes, description, aliases, profile } and use it to validate every referenced column.
        3) Always qualify tables as SCHEMA.TABLE and columns as SCHEMA.TABLE.COLUMN. Use table aliases consistently.

        B) Dialect
        4) Use standard ANSI-style SELECT syntax adapted to ${data.dbType}. 
        5) Do NOT use features that are not supported by ${data.dbType} (no vendor-specific features from other engines).

        C) Query Construction
        6) Always use explicit JOINs inferred from relationships visible in the schema (for example: *_id ↔ id, or keys clearly related in the schema). Do not invent columns or tables.
        7) Add necessary WHERE clauses implied by the question; respect datatypes (do not quote numeric values; treat dates and strings as parameters when needed).
        8) Use table aliases and format the query with indentation and line breaks.
        9) When “top/latest/best” is implied, add a deterministic ORDER BY and (if needed) LIMIT / TOP / OFFSET … FETCH, according to ${data.dbType}.
        10) Generate ONLY SELECT queries. Do NOT generate INSERT, UPDATE, DELETE, TRUNCATE or any data-modifying queries.
        11) Ignore any columns whose name contains "D_E_L_E_T_E" when constructing queries.
        12) If the question cannot be answered with the given schema (missing tables/columns or ambiguous semantics), you must return NOT_ANSWERED.
        13) Always fully qualify every table and column reference using: 
          - SCHEMA.TABLE and SCHEMA.TABLE.COLUMN.
          - Do not use unqualified names. Never omit schema names.

        D) Similarity Enforcement (STRICT)
        13) Let similarity_threshold = 0.95:
            - For each similar item, use its "score" property.
            - If some item's score is greater than similarity_threshold (score > similarity_threshold), reuse its SQL as-is:
                * Validate that all identifiers exist in the current schema.
                * If all identifiers are valid, output that SQL exactly as provided (no changes).
            - If no item's score is greater than similarity_threshold OR the reused SQL is invalid for the current schema:
                * You may adapt or combine the similar SQLs MINIMALLY to fit the current schema.
                * If after adaptation the query still cannot be made valid (missing tables/columns), return NOT_ANSWERED.

        E) Output & Fallback
        14) If you can answer the question:
            - Return ONLY the SQL SELECT query inside a code block with language "sql".
            - Do NOT include any explanations.
            - Do NOT include a trailing semicolon at the end ";".

        15) If you CANNOT answer the question with the given schema:
            - Return a code block in the following format:
            \`\`\`NOT_ANSWERED
            I don't know because <brief reason: e.g., missing columns/tables or ambiguous mapping>.
            \`\`\`

        ### Response Format, if you know the answer:
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

      this.logger.info(`Created prompt template: `, template);

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
