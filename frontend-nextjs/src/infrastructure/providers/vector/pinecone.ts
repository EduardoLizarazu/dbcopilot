import { Pinecone } from "@pinecone-database/pinecone";
export const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
export const pcIndex = pc.Index(process.env.PINECONE_INDEX!);

export class PineconeProvider {
  private _client: Pinecone;
  private _indexName: string;

  constructor() {
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
      throw new Error(
        "Pinecone API key or index name is not defined in environment variables."
      );
    }
    this._client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    this._indexName = process.env.PINECONE_INDEX!;
  }

  get client() {
    return this._client;
  }

  get indexName() {
    return this._indexName;
  }

  getIndex() {
    return this.client.Index(this.indexName);
  }

  getClient() {
    return this.client;
  }
  // Uploads a vector to Pinecone
  async upload(data: {
    id: string;
    embedding: number[];
    metadata: Record<string, any>;
  }) {
    return this.getIndex().upsert([
      {
        id: data.id,
        values: data.embedding,
        metadata: data.metadata,
      },
    ]);
  }
}
