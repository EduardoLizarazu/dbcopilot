import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "../env";
import { generateEmbedding } from "./openai";
import { generateRandomId } from "./ramdom-id";
import { SpladeVectors, TPineconeQueryResult } from "../types/pinecone";

export const PINECONE_NAMESPACE = env.pineconeNameSpace;
export const HF_URL = env.hfUrl;

export const pinecone = new Pinecone({
  apiKey: env.pineconeKey,
});

export const DenseIndex = pinecone.Index(env.pineconeIndex);
export const SparseIndex = pinecone.Index(env.sparsePineconeIndex);

export function EnsureSparseVectorValues(data: SpladeVectors) {
  const sparseVectors = data;
  // Ensure sparseValues matches RecordSparseValues: { indices: number[]; values: number[] }
  let sparseValuesRecord: SpladeVectors = {
    indices: [],
    values: [],
  };

  // If the returned sparseVectors already include indices, use them directly.
  if (
    (sparseVectors as any) &&
    Array.isArray((sparseVectors as any).indices) &&
    Array.isArray((sparseVectors as any).values)
  ) {
    sparseValuesRecord = {
      indices: (sparseVectors as any).indices,
      values: (sparseVectors as any).values,
    };
    return sparseValuesRecord;
  } else {
    // Otherwise build indices from non-zero entries in the values array.
    const vals = Array.isArray((sparseVectors as any).values)
      ? ((sparseVectors as any).values as number[])
      : [];

    const indices: number[] = [];
    const values: number[] = [];

    for (let i = 0; i < vals.length; i++) {
      const v = vals[i];
      if (v !== 0 && v !== null && v !== undefined) {
        indices.push(i);
        values.push(v);
      }
    }

    sparseValuesRecord = { indices, values };
    return sparseValuesRecord;
  }
}

export async function GetSparseVectors(data: {
  question: string;
}): Promise<SpladeVectors> {
  try {
    const res = await fetch(`${HF_URL}/splade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: data.question,
      }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const result = (await res.json()) as SpladeVectors;
    return result;
  } catch (error) {
    throw new Error(
      "Error generating sparse vectors: " + (error as Error).message
    );
  }
}

export async function Upsert(data: { question: string; query: string }) {
  try {
    const docId = await generateRandomId();
    const denseVectors = await generateEmbedding(`${data.question}`); // gen. dense vector
    const sparseVectors = await GetSparseVectors({ question: data.question }); // gen. sparse vector

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

    const sparseValuesRecord = EnsureSparseVectorValues(sparseVectors);

    await SparseIndex.namespace(PINECONE_NAMESPACE).upsert([
      {
        id: docId,
        sparseValues: sparseValuesRecord,
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

export async function queryDenseVector(
  question: string,
  topK = 3
): Promise<TPineconeQueryResult[]> {
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
    // delete namespace
    await DenseIndex.deleteNamespace(namespace);
    await SparseIndex.deleteNamespace(namespace);
    return true;
  } catch (error) {
    throw new Error(
      `Error deleting namespace '${namespace}': ` + (error as Error).message
    );
  }
}
