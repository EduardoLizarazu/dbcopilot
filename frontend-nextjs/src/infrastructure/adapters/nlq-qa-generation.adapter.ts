import { TCreateNlqQaGenerationPromptTemplate } from "@/core/application/dtos/nlq/nlq-qa-generation.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";

export class NlqQaGenerationAdapter implements INlqQaQueryGenerationPort {
  constructor(
    private readonly logger: ILogger,
    private readonly aiProvider: OpenAIProvider
  ) {}
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
