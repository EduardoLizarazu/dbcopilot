"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

export async function searchWithQuery(query: string) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    console.log("pinecone api key: ", process.env.PINECONE_API_KEY!);

    const indexList = await pc.listIndexes();

    // Use optional chaining and fallback to empty array
    const indexNames = indexList.indexes?.map((index) => index.name) ?? [];

    if (!indexNames.includes("text2sql-index")) {
      throw new Error(`
                Index "text2sql-index" not found. Available indexes: ${indexNames.join(", ")}
            `);
    }

    console.log("Index exists!");

    const index = pc.index(process.env.PINECONE_INDEX! || "text2sql-index");

    const embeddedQuery = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const results = await index.query({
      topK: 2,
      vector: embeddedQuery.data[0].embedding,
      includeMetadata: true,
    });
    console.log("embedded Results: ", results);

    return (
      results.matches?.map((match) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      })) || []
    );
  } catch (err) {
    console.error("Error during searchWithQuery:", err);
    throw new Error("Failed to perform semantic search.");
  }
}
