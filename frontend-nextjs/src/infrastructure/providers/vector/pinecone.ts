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

    (async () => await this.ensureIndexExists())();
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

  async ensureIndexExists() {
    const existingIndexes = await this.client.listIndexes();
    if (
      !existingIndexes.indexes.map((idx) => idx.name).includes(this.indexName)
    ) {
      console.log(
        `Pinecone index "${this.indexName}" does not exist. Creating...`
      );

      await this.client.createIndex({
        name: this.indexName,
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
    }
  }

  // Uploads a vector to Pinecone
  async upload(data: {
    id: string;
    embedding: number[];
    metadata: Record<string, any>;
  }) {
    const index = await this.getIndex(); // Await the asynchronous getIndex method
    return index.upsert([
      {
        id: data.id,
        values: data.embedding,
        metadata: data.metadata,
      },
    ]);
  }
}
