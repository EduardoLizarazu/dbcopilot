import {
  TCreateNlqQaKnowledgeDto,
  TNlqQaKnowledgeOutRequestDto,
  TUpdateNlqQaKnowledgeDto,
} from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaKnowledgeRepository } from "@/core/application/interfaces/nlq/nlq-qa-knowledge.app.inter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";

export class NlqQaKnowledgeAppRepository implements INlqQaKnowledgeRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly pineconeProvider: PineconeProvider,
    private readonly openaiProvider: OpenAIProvider
  ) {}

  async create(data: TCreateNlqQaKnowledgeDto): Promise<string> {
    try {
      // I have to upload the data to Pinecone. First, I need to create the embedding using OpenAI
      const embedding = await this.openaiProvider.generateEmbedding(
        data.question
      );

      // Now, I can upload the data to Pinecone

      await this.pineconeProvider.upload({
        id: data.id,
        embedding,
        metadata: {
          question: data.question,
          answer: data.query,
          tablesColumns: data.tablesColumns,
          nlqQaGoodId: data.nlqQaGoodId,
          nlqQaGoodDetailsId: data.nlqQaGoodDetailsId,
        },
      });

      return data.id;
    } catch (error) {
      this.logger.error("Error creating NLQ QA knowledge", { error });
      throw new Error("Error creating NLQ QA knowledge");
    }
  }
  async update(id: string, data: TUpdateNlqQaKnowledgeDto): Promise<void> {
    try {
    } catch (error) {
      this.logger.error("Error updating NLQ QA knowledge", { error });
      throw new Error("Error updating NLQ QA knowledge");
    }
  }
  async delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async findByQuestion(
    question: string
  ): Promise<TNlqQaKnowledgeOutRequestDto[]> {
    try {
      // First, generate the embedding for the question
      const embedding = await this.openaiProvider.generateEmbedding(question);

      // Now, query Pinecone for similar questions
      const { matches } = await this.pineconeProvider.getIndex().query({
        vector: embedding,
        topK: 5,
        includeMetadata: true,
      });

      // Map the results to TNlqQaKnowledgeOutRequestDto
      const results: TNlqQaKnowledgeOutRequestDto[] = (matches || []).map(
        (match) => ({
          id: String(match.id),
          nlqQaGoodDetailsId: match.metadata?.nlqQaGoodDetailsId
            ? String(match.metadata.nlqQaGoodDetailsId)
            : "",
          nlqQaGoodId: match.metadata?.nlqQaGoodId
            ? String(match.metadata.nlqQaGoodId)
            : "",
          question: match.metadata?.question
            ? String(match.metadata.question)
            : "",
          query: match.metadata?.answer ? String(match.metadata.answer) : "",
          tablesColumns: Array.isArray(match.metadata?.tablesColumns)
            ? match.metadata.tablesColumns.map(String)
            : typeof match.metadata?.tablesColumns === "string"
              ? [match.metadata.tablesColumns]
              : [],
          score: typeof match.score === "number" ? match.score : 0,
        })
      );
      return results;
    } catch (error) {
      this.logger.error("Error finding NLQ QA knowledge by question", {
        error,
      });
      throw new Error("Error finding NLQ QA knowledge by question");
    }
  }
  async findByQuery(query: string): Promise<TNlqQaKnowledgeOutRequestDto[]> {
    throw new Error("Method not implemented.");
  }
  async findById(id: string): Promise<TNlqQaKnowledgeOutRequestDto | null> {
    throw new Error("Method not implemented.");
  }
  async findAll(): Promise<TNlqQaKnowledgeOutRequestDto[]> {
    throw new Error("Method not implemented.");
  }
}
