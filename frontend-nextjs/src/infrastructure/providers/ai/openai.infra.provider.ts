import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
export const CHAT_MODEL = "gpt-4o-mini"; // fast, good reasoning
export const EMBEDDING_MODEL = "text-embedding-3-small"; // cost-effective

export class OpenAIProvider {
  private readonly _apiKey: string = process.env.OPENAI_API_KEY || "";
  private readonly _openai = new OpenAI({ apiKey: this._apiKey });
  private readonly _chatModel = "gpt-4o-mini"; // fast, good reasoning
  private readonly _embeddingModel = "text-embedding-3-small"; // cost-effective
  constructor() {}

  get apiKey() {
    return this._apiKey;
  }
  get openai() {
    return this._openai;
  }
  get chatModel() {
    return this._chatModel;
  }
  get embeddingModel() {
    return this._embeddingModel;
  }

  async generateChatCompletion(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.chatModel,
      messages: [{ role: "user", content: prompt }],
    });
    // Extract the message content from the response
    return response.choices[0]?.message?.content ?? "";
  }

  async generateEmbedding(input: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input,
    });
    return response.data[0].embedding;
  }
}
