import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

type schema = {
  table_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
  columns: {
    column_id: number;
    column_name: string;
    column_alias: string;
    column_description: string;
    column_data_type: string;
    column_key_type: string;
    column_key_is_static: boolean;
    foreign_key: number;
    primary_key: number;
    relation_description: string;
    relation_is_static: boolean;
  }[];
}[];

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateSQL(
    prompt: string,
    schema: schema,
    maxAttempts = 3,
  ): Promise<{ queries: string[]; finalQuery: string }> {
    const queries: string[] = [];
    let finalQuery = '';
    let attempts = 0;

    const systemMessage = `You are a SQL expert. Generate PostgreSQL queries based on this schema:
    ${schema}
    
    Rules:
    1. Return ONLY SQL code without Markdown formatting
    2. Never add explanations
    3. Use only existing tables and columns
    4. Answer with valid SQL syntax`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt },
    ];

    while (attempts < maxAttempts) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages,
          temperature: 0.2,
          max_tokens: 500,
        });

        const generatedQuery =
          completion.choices[0].message.content?.trim() || '';
        queries.push(generatedQuery);

        // Validate the query format before execution
        if (!this.validateQueryFormat(generatedQuery)) {
          throw new Error('Invalid SQL format');
        }

        finalQuery = generatedQuery;
        break;
      } catch (error) {
        attempts++;

        messages.push({
          role: 'assistant',
          content: queries[queries.length - 1],
        });

        messages.push({
          role: 'user',
          content: `Error: ${error.message}. Please generate a corrected SQL query.`,
        });

        if (attempts === maxAttempts) {
          throw new Error(
            `Failed after ${maxAttempts} attempts: ${error.message}`,
          );
        }
      }
    }

    return { queries, finalQuery };
  }

  private validateQueryFormat(query: string): boolean {
    const sqlRegex = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i;
    return sqlRegex.test(query);
  }
}
