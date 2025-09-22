import { TCreateNlqQaGenerationPromptTemplate } from "@/core/application/dtos/nlq/nlq-qa-generation.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaGenerationRepository } from "@/core/application/interfaces/nlq/nlq-qa-generation.inter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";

export class NlqQaGenerationInfraRepository
  implements INlqQaGenerationRepository
{
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
        max_tokens: 500,
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
      const template = `
        You are a SQL expert specialized in oracle19c databases. 
        Generate a SELECT query that answers the user's question using ONLY the provided database schema.

        ### Database Schema oracle19c:
        ${JSON.stringify(data.schemaBased, null, 2)}

        ### User Question:
        ${JSON.stringify(data.question, null, 2)}

        ### Similar Questions with SQL:
        ${JSON.stringify(data.similarKnowledgeBased, null, 2)}

        ### Instructions:
        1. Use ONLY the tables and columns from the provided schema
        2. Generate standard oracle19c SQL without database-specific extensions
        3. Return ONLY the SQL query with no additional text
        4. Always use explicit JOIN syntax instead of implicit joins
        5. Include necessary WHERE clauses based on the question
        6. Use table aliases for readability
        7. Format the query for readability
        8. Use the similarity question as inspiration but adapt to the current question and schema
        9. Generate the sql without ";", even at the end of the query
        10. If you don't know the answer, respond with why you don't know according to the format


        ### Response Format, if you know the answer:
        Return ONLY the SQL query inside a code block:
        \`\`\`sql
        SELECT ... WHERE ...
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
