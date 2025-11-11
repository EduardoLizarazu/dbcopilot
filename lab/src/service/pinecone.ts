import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "../env";
import { randomUUID } from "crypto";
import { generateEmbedding } from "./openai";

export const pinecone = new Pinecone({
  apiKey: env.pineconeKey,
});

export const index = pinecone.Index(env.pineconeIndex);

export async function upsert(data: { question: string; query: string }) {
  try {
    const docId = randomUUID();

    const vector = await generateEmbedding(`${data.question}`);

    await index.upsert([
      {
        id: docId,
        values: vector,
        metadata: {
          id: docId,
          question: data.question,
          query: data.query,
        },
      },
    ]);

    return docId;
  } catch (error) {
    throw new Error("Error upserting to Pinecone: " + (error as Error).message);
  }
}

export async function queryByQuestion(
  question: string,
  topK = 3
): Promise<
  {
    id: string;
    score: number;
    question: string;
    query: string;
  }[]
> {
  try {
    const vector = await generateEmbedding(question);
    const result = await index.query({
      vector,
      topK,
      includeMetadata: true,
    });

    const matches = result.matches || [];
    const dto = matches.map((match) => ({
      id: match.id || "",
      score: match.score || 0,
      question: String(match.metadata?.question ?? ""),
      query: String(match.metadata?.query ?? ""),
    }));

    return dto;
  } catch (error) {
    throw new Error("Error querying Pinecone: " + (error as Error).message);
  }
}

export async function upsertBuilder(
  data: { question: string; query: string }[]
) {
  try {
    const ids = await Promise.all(
      data.map(async (item) => {
        return await upsert({
          question: item.question,
          query: item.query,
        });
      })
    );
  } catch (error) {
    throw new Error(
      "Error upserting data to Pinecone: " + (error as Error).message
    );
  }
}
