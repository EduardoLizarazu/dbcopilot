import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "@/core/application/ports/nlq-qa-topology-generation.port";
import { OpenAIProvider } from "../providers/ai/openai.infra.provider";

export class NlqQaTopologyGenerationAdapter
  implements INlqQaTopologyGenerationPort
{
  constructor(
    private readonly logger: ILogger,
    private readonly openaiProvider: OpenAIProvider
  ) {}

  async genDetailQuestion(data: {
    question: string;
    query: string;
  }): Promise<{ detailQuestion: string }> {
    try {
      this.logger.info(
        `[NlqQaTopologyGenerationAdapter] Generating detailed question from query: ${data.query}`
      );
      const prompt = `
        Given the following user question and sql query,
        generate a more detailed question that captures the intent of the user.

        ### User Question:
        ${data.question}

        ### SQL Query:
        ${data.query}

        ### Instructions:
        1. Generate a detailed question that captures the intent of the user.
        2. The detailed question should be specific and unambiguous.
        3. Return ONLY the detailed question with as the response format.
        4. Do not include any additional text or explanation.
        5. Always use the same language as the user question.
        6. If the user question is vague, make reasonable assumptions to clarify it.

        ### Response format Detailed Question:
        Return the detailed question only with no additional text.
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
        Given the following sql query,
        extract the tables and columns used in the query.
        ### SQL Query:
        ${data.query}
        ### Instructions:
        1. Extract the tables and columns used in the query.
        2. Return the tables and columns as a list of strings in the format "table.column".
        3. Return ONLY the list of tables and columns with no additional text.
        4. If a table is used without a column, return the table name only.
        5. If a column is used without a table, return the column name only.
        6. Do not include duplicates in the list.
        7. If the query is invalid or does not contain any tables or columns, return an empty list.
        ### Response format Tables and Columns:
        Return the tables and columns as a JSON array of strings.
        \`\`\`json
            [
                "table1.column1",
                "table2.column2",
                "table3"
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
                "You are an expert SQL parser that extracts tables and columns from SQL queries.",
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
      const tcRes = response.choices[0]?.message?.content?.trim() || "";
      const tablesColumnsExtraction = tcRes.match(/```json\n([\s\S]*?)\n```/);
      if (tablesColumnsExtraction && tablesColumnsExtraction[1]) {
        const tablesColumns = JSON.parse(tablesColumnsExtraction[1].trim());
        this.logger.info(
          `[NlqQaTopologyGenerationAdapter] Generated tables and columns: ${JSON.stringify(tablesColumns)}`
        );
        return { tablesColumns };
      }
      this.logger.warn(
        "[NlqQaTopologyGenerationAdapter] Warning: Could not extract tables and columns from response"
      );
      return { tablesColumns: [] };
    } catch (error) {
      this.logger.error(
        "[NlqQaTopologyGenerationAdapter] Error generating tables and columns",
        { error }
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
