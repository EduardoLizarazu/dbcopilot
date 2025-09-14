import { Pinecone } from "@pinecone-database/pinecone";
export const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
export const pcIndex = pc.Index(process.env.PINECONE_INDEX!);

export class PineconeProvider {
  private _client: Pinecone;
  private _indexName: string;

  constructor(apiKey: string, indexName: string) {
    this._client = new Pinecone({ apiKey });
    this._indexName = indexName;
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
}
