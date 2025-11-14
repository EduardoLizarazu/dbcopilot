import OpenAI from "openai";
import { env } from "../env";

const CHAT_MODEL = "gpt-4o-mini"; // fast, good reasoning
const EMBEDDING_MODEL = "text-embedding-3-small"; // cost-effective

export const openai = new OpenAI({
  apiKey: env.openaiKey,
});

export async function generateEmbedding(input: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input,
    });
    return response.data[0].embedding;
  } catch (error) {
    throw new Error("Error generating embedding" + (error as Error).message);
  }
}

export async function queryGeneration(
  prompt: string
): Promise<{ answer: string }> {
  try {
    const response = await openai.chat.completions.create({
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
    throw new Error("Error generating query from prompt");
  }
}
