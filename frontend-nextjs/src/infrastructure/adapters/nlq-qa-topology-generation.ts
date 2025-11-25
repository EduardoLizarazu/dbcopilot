import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "@/core/application/ports/nlq-qa-topology-generation.port";
import { OpenAIProvider } from "../providers/ai/openai.infra.provider";
import { TSchemaCtxSimpleSchemaDto } from "@/core/application/dtos/schemaCtx.dto";

export class NlqQaTopologyGenerationAdapter
  implements INlqQaTopologyGenerationPort
{
  constructor(
    private readonly logger: ILogger,
    private readonly openaiProvider: OpenAIProvider
  ) {}
  async genSchemaCtx(
    data: TSchemaCtxSimpleSchemaDto
  ): Promise<TSchemaCtxSimpleSchemaDto> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating schema context for schema: `,
        data
      );

      /**
       * type TSchemaCtxSimpleSchemaDto = {
    id?: string;
    name?: string;
    description?: string;
    aliases?: string[];
    table?: {
        id?: string;
        name?: string;
        description?: string;
        aliases?: string[];
        column?: {
            id?: string;
            name?: string;
            description?: string;
            aliases?: string[];
            dataType?: string;
            profile?: {
                maxValue?: string;
                minValue?: string;
                countNulls?: number;
                countUnique?: number;
                sampleUnique?: string[];
            };
        };
    };
}
       */

      const prompt = `
        You are given a schema context in JSON with the following TypeScript shape:

        type TSchemaCtxSimpleSchemaDto = {
          id?: string;
          name?: string;
          description?: string;
          aliases?: string[];
          table?: {
            id?: string;
            name?: string;
            description?: string;
            aliases?: string[];
            column?: {
              id?: string;
              name?: string;
              description?: string;
              aliases?: string[];
              dataType?: string;
              profile?: {
                maxValue?: string;
                minValue?: string;
                countNulls?: number;
                countUnique?: number;
                sampleUnique?: string[];
              };
            };
          };
        };

        The schema, table and column may already contain descriptions and aliases.
        Use them as a guide and **rewrite or refine** them if you can make them clearer or more informative.

        The goal is to enrich the context at three levels:

        - **Level 1: Schema context ("schema ctx")**
          - \`description\`: High-level, general concept of what the entire schema represents.
            It should capture the business domain and the overall purpose, remembering that
            the schema groups multiple tables and columns.
          - \`aliases\`: At least 10 aliases / synonyms / search phrases that a user might
            use to refer to this schema. Make them semantically related to the schema name
            and its purpose.

        - **Level 2: Table context ("table ctx")**
          - \`description\`: More detailed explanation of what the table represents,
            including what kind of records it stores and how it fits into the schema.
            You may infer meaning from the table name, existing description and column profiles.
          - \`aliases\`: At least 10 aliases / synonyms / search phrases that describe
            what the table is about. For example, if the table is "PB7300" and it stores
            delivery orders, use phrases like "delivery orders", "shipment orders", etc.

        - **Level 3: Column context ("column ctx")**
          - \`description\`: The most detailed level. Explain what each column means,
            how it is used, and how it relates to the other columns. Use the
            \`profile\` information (maxValue, minValue, sampleUnique, etc.) to infer the semantics.
          - \`aliases\`: At least 10 aliases / synonyms / search phrases per column
            when possible (e.g. "customer id", "client code", "client identifier", etc.).

        **Important rules:**

        1. If there is an existing \`description\`, keep its meaning but improve clarity and detail.
        2. If there are existing \`aliases\`, keep the good ones and add more, up to
          at least 10 aliases in total when it makes sense.
        3. Do **not** invent technical details that contradict obvious semantics
          (e.g. do not call an ID column a "currency" column).
        4. Use concise but informative sentences (1–3 sentences per description).
        5. Use aliases that are realistic search queries for NLQ (natural language query) use cases.

        **Input schema context:**
        \`\`\`json
        ${JSON.stringify(data, null, 2)}
        \`\`\`

        **Output format (very important):**

        - Return **only** a JSON object, with the **same structure** as the input.
        - Preserve all existing fields (\`id\`, \`name\`, \`dataType\`, \`profile\`, etc.).
        - Only modify or fill the \`description\` and \`aliases\` fields at schema, table and column level.
        - Do not include any prose or explanation, just the JSON.

        Example shape (just to illustrate, not actual values):

        \`\`\`json
        {
          "id": "...",
          "name": "...",
          "description": "Enriched schema description...",
          "aliases": [
            "alias 1",
            "alias 2",
            "... at least 10",
          ],
          "table": {
            "id": "...",
            "name": "...",
            "description": "Enriched table description...",
            "aliases": [
              "alias 1",
              "alias 2",
              "... at least 10"
            ],
            "column": {
              "id": "...",
              "name": "...",
              "description": "Enriched column description...",
              "aliases": [
                "alias 1",
                "alias 2",
                "... at least 10"
              ],
              "dataType": "...",
              "profile": {
                "maxValue": "...",
                "minValue": "...",
                "countNulls": 0,
                "countUnique": 0,
                "sampleUnique": ["..."]
              }
            }
          }
        }
        \`\`\`
      `;

      const response = await this.openaiProvider.openai.chat.completions.create(
        {
          model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
          messages: [
            {
              role: "system",
              content: `
                You are an assistant that enriches database schema metadata.

                Given a schema context object, you must:
                - Infer **semantic descriptions** at 3 levels:
                  - Level 1: Schema context
                  - Level 2: Table context
                  - Level 3: Column context
                - Generate **rich, business-friendly descriptions**.
                - Generate **at least 10 meaningful aliases** (synonyms / search phrases) whenever possible.
                - Preserve the original JSON structure and any fields not related to descriptions or aliases.
              `,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1, // Low temperature for deterministic output
          top_p: 0.1,
          max_tokens: 1500,
        }
      );
      const qRes = response.choices[0]?.message?.content?.trim() || "";

      const schemaCtxSummaryExtraction = qRes.match(/```json\n([\s\S]*?)\n```/);
      if (schemaCtxSummaryExtraction && schemaCtxSummaryExtraction[1]) {
        const schemaCtxSummary = JSON.parse(
          schemaCtxSummaryExtraction[1].trim()
        );
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated schema context summary: ${JSON.stringify(
            schemaCtxSummary
          )}`
        );
        return schemaCtxSummary;
      }
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating schema context",
        error.message
      );
      throw new Error(error.message || "Error generating schema context");
    }
  }

  async genDetailQuestion(data: {
    question: string;
    query: string;
  }): Promise<{ detailQuestion: string }> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating detailed question from query: ${data.query}`
      );
      const prompt = `
        You will rewrite the user question so that it fully reflects the business logic contained in the SQL query. 
        The rewritten question must capture every relevant filter, condition, grouping, metric, time range, and scope present in the SQL.

        ### User Question:
        ${data.question}

        ### SQL Query:
        ${data.query}

        ### Instructions:
        1. Use the SQL as the source of truth — do NOT introduce logic not present in the query.
        2. Explicitly include all business rules found in the SQL (filters, conditions, groupings, date ranges, status flags, currency filters, etc.).
        3. If the original question is vague, clarify it based ONLY on the SQL logic.
        4. Preserve the original language of the user.
        5. Make the question precise, specific, and unambiguous.
        6. DO NOT mention SQL or technical terms — rewrite only in business language.


        ### Response format Detailed Question:
        Return ONLY the rewritten detailed question.
        \`\`\`question
            <detailed question>
        \`\`\`
      `;

      const response = await this.openaiProvider.openai.chat.completions.create(
        {
          model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
          messages: [
            {
              role: "system",
              content:
                "You are an export analyst that generates detailed questions from database queries.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1, // Low temperature for deterministic output
          max_tokens: 500,
          top_p: 0.1,
        }
      );
      const qRes = response.choices[0]?.message?.content?.trim() || "";

      const detailQuestionExtraction = qRes.match(
        /```question\n([\s\S]*?)\n```/
      );
      if (detailQuestionExtraction && detailQuestionExtraction[1]) {
        const detailQuestion = detailQuestionExtraction[1].trim();
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated detailed question: ${detailQuestion}`
        );
        return { detailQuestion };
      }
      this.logger.warn(
        "[NlqQaTopologyGenerationAdapter] Warning: Could not extract detailed question from response"
      );
      return { detailQuestion: qRes };
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating detailed question",
        { error }
      );
      throw new Error("Error generating detailed question");
    }
  }
  async genTablesColumns(data: {
    query: string;
  }): Promise<{ tablesColumns: string[] }> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating tables and columns from query: ${data.query}`
      );
      const prompt = `
        Given the following SQL query, extract every schema, table, and column reference used, and also the conditions (restrictions) applied to those columns.

        ### SQL Query:
        ${data.query}

        ### Extraction Rules:

        1. Normalize every column reference into a physical path with the format:
          - "schema.table.column"
          - If the schema is not present in the SQL for that table, use "unknown" as the schema.
          - If the column appears without any table and you cannot safely infer the table, use "unknown.unknown.column".

        2. For every **table reference** (in FROM, JOIN, subqueries, etc.) you MUST also include a table-level entry:
          - "schema.table"
          - If the schema is missing: "unknown.table".

        3. When columns are referenced **without a table or alias prefix**:
          - If there is exactly **one base table** in the FROM clause (ignoring joins), assume that all unqualified columns belong to that table.
          - If there are multiple candidate tables and you cannot safely decide, treat the column as:
            - "unknown.unknown.column".

        4. For every column that appears in a condition with a **literal value** (for example in WHERE, HAVING, or JOIN conditions with a literal), also add an entry with the restriction, using this format:
          - "schema.table.column.[restriction]"

          The [restriction] MUST be based on **literal values only**, NOT on other columns.

          Examples (valid):
          - \`WHERE public.customer.customer_id = 1\`
            → "public.customer"
            → "public.customer.customer_id"
            → "public.customer.customer_id.[1]"

          - \`WHERE public.customer.first_name = 'JOHN'\`
            → "public.customer"
            → "public.customer.first_name"
            → "public.customer.first_name.['JOHN']"

          - \`WHERE c.id IN (1, 2, 3)\`
            → "schema.table"
            → "schema.table.id"
            → "schema.table.id.[IN (1, 2, 3)]"

          - \`WHERE created_at BETWEEN '2023-01-01' AND '2023-01-31'\`
            → "schema.table"
            → "schema.table.created_at"
            → "schema.table.created_at.[BETWEEN '2023-01-01' AND '2023-01-31']"

          - \`WHERE code LIKE 'PA01%'\`
            → "schema.table"
            → "schema.table.code"
            → "schema.table.code.[LIKE 'PA01%']"

        5. **Aggregates in HAVING (IMPORTANT)**  
          If an aggregate function like \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\` is applied to a column and the result is compared with a literal in HAVING, you MUST:
          - Ignore the function name itself.
          - Treat the argument of the function as the target column.
          - Attach the literal as a restriction to that column.

          Example:
          - \`HAVING COUNT(public.rental.rental_id) > 10\`
            MUST produce:
            - "public.rental"
            - "public.rental.rental_id"
            - "public.rental.rental_id.[> 10]"

          Another example:
          - \`HAVING SUM(sales.amount) >= 1000\`
            → "schema.sales"
            → "schema.sales.amount"
            → "schema.sales.amount.[>= 1000]"

        6. VERY IMPORTANT - Do NOT treat column = column as a restriction:
          - If a condition compares a column with another column (e.g. \`a.city_id = b.city_id\`), DO NOT generate a restriction entry with brackets.
          - In those cases, only include the plain table and column references, without \`[restriction]\`.

          Invalid (DO NOT generate):
          - \`public.address.city_id = public.city.city_id\`
            ✗ "public.address.city_id.[public.city.city_id]"

          Valid behavior:
          - "public.address"
          - "public.address.city_id"
          - "public.city"
          - "public.city.city_id"

        7. Type/quoting rules for [restriction]:
          - If the literal is numeric (e.g., 1, 10.5), return it without quotes: "[1]", "[10.5]".
          - If the literal is a string, date, or other non-numeric type, return it with single quotes as in SQL: "['ACTIVE']", "['2023-01-01']".
          - For complex conditions (IN, BETWEEN, LIKE, etc.), put the full literal expression inside the brackets, but only if the expression is based on literals, not on columns.

        8. Include columns (and corresponding table-level entries) referenced in:
          - SELECT
          - WHERE
          - JOIN
          - GROUP BY / HAVING
          - ORDER BY
          - subqueries

        9. For aggregates:
          - Ignore the function wrapper (e.g. do NOT return "COUNT(public.rental.rental_id)").
          - Only work with the inner column (e.g. "public.rental.rental_id") and its comparison literals.

        10. Always expand table aliases to their base table names when possible.
            - If you cannot resolve the schema from the SQL, use "unknown" as schema.
            - If you cannot resolve the table, use "unknown" as table.

        11. Do **not** include functions, operators, or literals by themselves (only within [restriction] on a column).

        12. Do **not** infer tables or columns that do not explicitly appear or cannot be inferred safely from the FROM/JOIN structure.

        13. Remove duplicates.

        14. Response format:
            - Return ONLY a valid JSON array of strings.
            - Do not include explanations, markdown, or code fences.

        ### Response Example:

        For this query:

        HAVING COUNT(public.rental.rental_id) > 10

        A correct response MUST include:

        [
          "public.rental",
          "public.rental.rental_id",
          "public.rental.rental_id.[> 10]"
        ]
        `;

      const response = await this.openaiProvider.openai.chat.completions.create(
        {
          model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
          messages: [
            {
              role: "system",
              content:
                "You are an expert SQL parser that extracts schema, tables and columns from SQL queries.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1, // Low temperature for deterministic output
          max_tokens: 1000,
          top_p: 0.1,
        }
      );
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] OpenAI response for tables and columns:`,
        response
      );

      const tcRes = response.choices[0]?.message?.content?.trim() || "";
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Raw tables and columns response: `,
        JSON.stringify(tcRes)
      );
      if (tcRes.startsWith("[")) {
        const tablesColumns = JSON.parse(tcRes);
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated tables and columns: `,
          tablesColumns
        );
        return { tablesColumns };
      }
      if (tcRes.startsWith("```json")) {
        const tablesColumnsExtraction = tcRes.match(/```json\n([\s\S]*?)\n```/);
        if (tablesColumnsExtraction && tablesColumnsExtraction[1]) {
          const tablesColumns = JSON.parse(tablesColumnsExtraction[1].trim());
          this.logger.info(
            `[NlqQaTopologyGenerationAdapter] Generated tables and columns: `,
            tablesColumns
          );
          return { tablesColumns };
        }
      }
      this.logger.warn(
        "[NlqQaTopologyGenerationAdapter] Warning: Could not extract tables and columns from response",
        tcRes
      );
      return { tablesColumns: [] };
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating tables and columns",
        { message: error.message }
      );
      throw new Error("Error generating tables and columns");
    }
  }
  async genSemanticFields(data: {
    question: string;
    query: string;
  }): Promise<{ semanticFields: { field: string; purpose: string }[] }> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating semantic fields from question: ${data.question} and query: ${data.query}`
      );
      const prompt = `
        Given the following user question and sql query,
        extract the semantic fields used in the query and their purpose in the context of the user's question.
        ### User Question:
        ${data.question}
        ### SQL Query:
        ${data.query}
        ### Instructions:
        1. Extract the semantic fields used in the query and their purpose in the context of the user's question.
        2. Return the semantic fields as a list of objects in the format {"field": "table.column", "purpose": "description of purpose"}.
        3. Return ONLY the list of semantic fields with no additional text.
        4. If a table is used without a column, return the table name only.
        5. If a column is used without a table, return the column name only.
        6. Do not include duplicates in the list.
        7. If the query is invalid or does not contain any semantic fields, return an empty list.
        ### Response format Semantic Fields:
        Return the semantic fields as a JSON array of objects.
        \`\`\`json
            [
                {"field": "table1.column1", "purpose": "description of purpose"},
                {"field": "table2.column2", "purpose": "description of purpose"},
                {"field": "table3", "purpose": "description of purpose"}
            ]
        \`\`\`
        `;
      const response = await this.openaiProvider.openai.chat.completions.create(
        {
          model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
          messages: [
            {
              role: "system",
              content:
                "You are an expert SQL analyst that extracts semantic fields from SQL queries in the context of user questions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );
      const sfResponse = response.choices[0]?.message?.content?.trim() || "";
      const semanticFieldsExtraction = sfResponse.match(
        /```json\n([\s\S]*?)\n```/
      );
      if (semanticFieldsExtraction && semanticFieldsExtraction[1]) {
        const semanticFields = JSON.parse(semanticFieldsExtraction[1].trim());
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated semantic fields: ${JSON.stringify(semanticFields)}`
        );
        return { semanticFields };
      }
      this.logger.warn(
        "[NlqQaTopologyGenerationAdapter] Warning: Could not extract semantic fields from response"
      );
      return { semanticFields: [] };
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating semantic fields",
        { error }
      );
      throw new Error("Error generating semantic fields");
    }
  }
  async genSemanticTables(data: {
    question: string;
    query: string;
  }): Promise<{ semanticTables: { table: string; purpose: string }[] }> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating semantic tables from question: ${data.question} and query: ${data.query}`
      );
      const prompt = `
        Given the following user question and sql query,
        extract the semantic tables used in the query and their purpose in the context of the user's question.
        ### User Question:
        ${data.question}
        ### SQL Query:
        ${data.query}
        ### Instructions:
        1. Extract the semantic tables used in the query and their purpose in the context of the user's question.
        2. Return the semantic tables as a list of objects in the format {"table": "table_name", "purpose": "description of purpose"}.
        3. Return ONLY the list of semantic tables with no additional text.
        4. Do not include duplicates in the list.
        5. If the query is invalid or does not contain any semantic tables, return an empty list.
        ### Response format Semantic Tables:
        Return the semantic tables as a JSON array of objects.
        \`\`\`json
            [
                {"table": "table1", "purpose": "description of purpose"},
                {"table": "table2", "purpose": "description of purpose"},
            ]
        \`\`\`
        `;
      const response = await this.openaiProvider.openai.chat.completions.create(
        {
          model: "gpt-4-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );
      const semanticTablesExtraction =
        response.choices[0]?.message?.content?.trim() || "";
      const semanticTablesMatch = semanticTablesExtraction.match(
        /```json\n([\s\S]*?)\n```/
      );
      if (semanticTablesMatch && semanticTablesMatch[1]) {
        const semanticTables = JSON.parse(semanticTablesMatch[1].trim());
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated semantic tables: ${JSON.stringify(semanticTables)}`
        );
        return { semanticTables };
      }
      this.logger.warn(
        "[NlqQaTopologyGenerationAdapter] Warning: Could not extract semantic tables from response"
      );
      return { semanticTables: [] };
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating semantic tables",
        { error }
      );
      throw new Error("Error generating semantic tables");
    }
  }
  async genFlags(data: {
    question: string;
    query: string;
  }): Promise<{ flags: { field: string; flag: string }[] }> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating flags from question: ${data.question} and query: ${data.query}`
      );
      const prompt = `
        Given the following user question and sql query,
        identify any potential flags or issues with the query in the context of the user's question.
        ### User Question:
        ${data.question}
        ### SQL Query:
        ${data.query}
        ### Instructions:
        1. Identify any potential flags or issues with the query in the context of the user's question.
        2. Return the flags as a list of objects in the format {"field": "table.column", "flag": "description of flag"}.
        3. Return ONLY the list of flags with no additional text.
        4. If a table is used without a column, return the table name only.
        5. If a column is used without a table, return the column name only.
        6. Do not include duplicates in the list.
        7. If the query is valid and does not contain any flags, return an empty list.
        ### Response format Flags:
        Return the flags as a JSON array of objects.
        \`\`\`json
            [
                {"field": "table1.column1", "flag": "description of flag"},
                {"field": "table2.column2", "flag": "description of flag"},
            ]
        \`\`\`
        `;
      const response = await this.openaiProvider.openai.chat.completions.create(
        {
          model: "gpt-4-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );
      const flagsExtraction =
        response.choices[0]?.message?.content?.trim() || "";
      const flagsMatch = flagsExtraction.match(/```json\n([\s\S]*?)\n```/);
      if (flagsMatch && flagsMatch[1]) {
        const flags = JSON.parse(flagsMatch[1].trim());
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated flags: ${JSON.stringify(flags)}`
        );
        return { flags };
      }
      this.logger.warn(
        "[NlqQaTopologyGenerationAdapter] Warning: Could not extract flags from response"
      );
      return { flags: [] };
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating flags",
        { error }
      );
      throw new Error("Error generating flags");
    }
  }
  async genThinkProcess(data: {
    question: string;
    query: string;
  }): Promise<{ think: string }> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating think process from question: ${data.question} and query: ${data.query}`
      );
      const prompt = `
        Given the following user question and sql query,
        describe the thought process behind generating the query in the context of the user's question.
        ### User Question:
        ${data.question}
        ### SQL Query:
        ${data.query}
        ### Instructions:
        1. Describe the thought process behind generating the query in the context of the user's question.
        2. Return ONLY the thought process with no additional text.
        3. If the query is invalid or does not relate to the user's question, explain why.
        4. Use clear and concise language.
        5. If you don't know the answer, respond with why you don't know according to the format.
        6. Always use the same language as the user question.
        
        ### Response format Think Process:
        Return the thought process only.
        \`\`\`think
            <thought process>
        \`\`\`
      `;
      const response = await this.openaiProvider.openai.chat.completions.create(
        {
          model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
          messages: [
            {
              role: "system",
              content:
                "You are an expert SQL analyst that explains the thought process behind SQL queries in the context of user questions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );
      const tpResponse = response.choices[0]?.message?.content?.trim() || "";

      const thinkProcessExtraction = tpResponse.match(
        /```think\n([\s\S]*?)\n```/
      );
      if (thinkProcessExtraction && thinkProcessExtraction[1]) {
        const think = thinkProcessExtraction[1].trim();
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated think process: ${think}`
        );
        return { think };
      }
      this.logger.warn(
        "[NlqQaTopologyGenerationAdapter] Warning: Could not extract think process from response"
      );
      return { think: tpResponse };
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating think process",
        { error }
      );
      throw new Error("Error generating think process");
    }
  }
}
