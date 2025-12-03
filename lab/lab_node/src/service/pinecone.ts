import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "../env";
import { generateEmbedding } from "./openai";
import { generateRandomId } from "./ramdom-id";

export const PINECONE_NAMESPACE = env.pineconeNameSpace;

export const pinecone = new Pinecone({
  apiKey: env.pineconeKey,
});

export const DenseIndex = pinecone.Index(env.pineconeIndex);

export async function Upsert(data: { question: string; query: string }) {
  try {
    const docId = await generateRandomId();
    const denseVectors = await generateEmbedding(`${data.question}`);

    await DenseIndex.namespace(PINECONE_NAMESPACE).upsert([
      {
        id: docId,
        values: denseVectors,
        metadata: {
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
    const result = await DenseIndex.namespace(PINECONE_NAMESPACE).query({
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
        return await Upsert({
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

// Delete all vectors in a namespace so you can restart with a clean slate.
export async function deleteNamespace(namespace = "test") {
  try {
    // delete with deleteAll: true will remove all vectors in the namespace
    await index.delete({ deleteAll: true, namespace });
    return true;
  } catch (error) {
    throw new Error(
      `Error deleting namespace '${namespace}': ` + (error as Error).message
    );
  }
}
