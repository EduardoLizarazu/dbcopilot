import {
  TCreateNlqQaKnowledgeDto,
  TNlqQaKnowledgeOutRequestDto,
  TUpdateNlqQaKnowledgeDto,
  TUpdateSplitterNameOnKnowledgeBaseDto,
} from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone";

export class NlqQaKnowledgeAdapter implements INlqQaKnowledgePort {
  constructor(
    private readonly logger: ILogger,
    private readonly pineconeProvider: PineconeProvider,
    private readonly openaiProvider: OpenAIProvider
  ) {}
  async transferSplitterKnowledge(data: {
    id: string;
    oldSplitterName: string;
    newSplitterName: string;
  }): Promise<void> {
    try {
      this.logger.info("Transferring splitter knowledge", { data });
      const index = this.pineconeProvider.getIndex();

      const fetchResult = await index
        .namespace(data.oldSplitterName)
        .fetch([data.id]);
      const record = fetchResult?.records?.[data.id];

      if (!record) {
        this.logger.error("Error transferring splitter knowledge", {
          message: "Record not found",
        });
        throw new Error("Record not found");
      }

      // 4. Upsert the record to the new namespace
      const upsertData = {
        id: record.id,
        values: record.values,
        metadata: record.metadata,
      };

      await index.namespace(data.newSplitterName).upsert([upsertData]);
      this.logger.info("Successfully transferred splitter knowledge", { data });

      // 5. Delete the record from the old namespace
      await index.namespace(data.oldSplitterName).deleteOne(data.id);
      this.logger.info("Deleted old splitter knowledge", { data });
    } catch (error) {
      this.logger.error("Error transferring splitter knowledge", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(error.message || "Error transferring splitter knowledge");
    }
  }
  /**
   *
   * Update the name of a splitter in the knowledge base.
   * 1. List all vectors id in the old namespace.
   * 2. For each vector id, fetch the vector data (embeddings & metadata)
   * 3. Re-upload the vector data to the new namespace with the same id (embedding & metadata).
   * 4. Delete the old namespace.
   *
   * @param data - Object containing oldName and newName of the splitter.
   * @throws Error if there is an issue during the update process.
   * @returns void
   */

  async updateSplitterName(
    data: TUpdateSplitterNameOnKnowledgeBaseDto
  ): Promise<void> {
    try {
      this.logger.info("Updating splitter name", { data });

      // 1. List all vectors id in the old namespace.
      const index = this.pineconeProvider.getIndex();
      const paginationList = await index
        .namespace(data.oldName)
        .listPaginated();
      const vectorIds: string[] = [];
      for await (const page of paginationList.vectors) {
        const id = page.id;
        vectorIds.push(id);
      }
      this.logger.info(
        `[NlqQaKnowledgeAdapter] Processing ${vectorIds.length} vectors`,
        { vectorIds }
      );

      // 2. For each vector id, fetch the vector data (embeddings & metadata)
      const vectorData: PineconeRecord<RecordMetadata>[] = [];
      for (const id of vectorIds) {
        const fetchResult = await index.namespace(data.oldName).fetch([id]);
        const record = fetchResult?.records?.[id];
        if (record) {
          vectorData.push(record);
        }
      }

      this.logger.info(`Fetched data for ${vectorData.length} vectors`, {
        vectorData,
      });

      // 3. Re-upload the vector data to the new namespace with the same id (embedding & metadata).
      const upsertData = vectorData.map((vec) => ({
        id: vec.id,
        values: vec.values,
        metadata: vec.metadata,
      }));
      await index.namespace(data.newName).upsert(upsertData);
      this.logger.info(
        `Upserted ${upsertData.length} vectors to new namespace`,
        {
          newNamespace: data.newName,
        }
      );

      await this.deleteAllBySplitter(data.oldName);
      this.logger.info(`Deleted old namespace`, { oldNamespace: data.oldName });
      this.logger.info("Successfully updated splitter name");
    } catch (error) {
      this.logger.error("[NlqQaKnowledgeAdapter] Error updating namespace", {
        message: error instanceof Error ? error.message : "Unknown error",
        rawError: error,
      });
      throw new Error((error as Error).message);
    }
  }
  async deleteAllBySplitter(splitterName: string): Promise<void> {
    try {
      const index = this.pineconeProvider.getIndex();
      const namespace = await index.listNamespaces();

      // Check if the namespace exists
      const namespaceExists = namespace.namespaces.some(
        (ns) => ns === splitterName
      );

      if (!namespaceExists) {
        this.logger.warn(
          `[NlqQaKnowledgeAdapter] Namespace ${splitterName} does not exist. Skipping deletion.`
        );
        return;
      }

      await this.pineconeProvider.getIndex().deleteNamespace(splitterName);
    } catch (error) {
      this.logger.error("[NlqQaKnowledgeAdapter] Error deleting namespace", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
        rawError: error,
      });
      throw new Error((error as Error).message || "Error deleting namespace");
    }
  }

  async create(data: TCreateNlqQaKnowledgeDto): Promise<string> {
    try {
      // I have to upload the data to Pinecone. First, I need to create the embedding using OpenAI
      const embedding = await this.openaiProvider.generateEmbedding(
        data.question
      );
      this.logger.info("Generated embedding for question");
      if (!embedding || embedding.length === 0) {
        this.logger.error("Failed to generate embedding for the question");
        throw new Error("Failed to generate embedding for the question");
      }
      // Now, I can upload the data to Pinecone
      const index = this.pineconeProvider.getIndex();
      await index.namespace(data.namespace).upsert([
        {
          id: data.id,
          values: embedding,
          metadata: {
            question: data.question,
            answer: data.query,
            tablesColumns: data.tablesColumns,
            nlqQaGoodId: data.nlqQaGoodId,
          },
        },
      ]);

      return data.id;
    } catch (error) {
      this.logger.error(
        "[NlqQaKnowledgeAdapter] Error creating NLQ QA knowledge",
        {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : null,
          rawError: error,
        }
      );
      throw new Error(error.message || "Error creating NLQ QA knowledge");
    }
  }
  async update(id: string, data: TUpdateNlqQaKnowledgeDto): Promise<void> {
    try {
      // To update a vector in Pinecone, I need to re-upload it with the same ID
      const embedding = await this.openaiProvider.generateEmbedding(
        data.question
      );
      await this.pineconeProvider.getIndex().upsert([
        {
          id,
          values: embedding,
          metadata: {
            question: data.question,
            answer: data.query,
            tablesColumns: data.tablesColumns,
            nlqQaGoodId: data.nlqQaGoodId,
          },
        },
      ]);
    } catch (error) {
      this.logger.error("Error updating NLQ QA knowledge", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
        rawError: error,
      });
      throw new Error(error.message || "Error updating NLQ QA knowledge");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.pineconeProvider.getIndex().deleteOne(id);
    } catch (error) {
      this.logger.error("Error deleting NLQ QA knowledge", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(error.message || "Error deleting NLQ QA knowledge");
    }
  }

  async deleteSplitter(id: string, splitter_name: string): Promise<void> {
    try {
      // To delete all vectors in a namespace, I can use the delete method with a filter
      await this.pineconeProvider
        .getIndex()
        .namespace(splitter_name)
        .deleteOne(id);
    } catch (error) {
      this.logger.error("Error deleting NLQ QA knowledge for splitter", {
        error: error.message || error,
      });
      throw new Error(
        error.message || "Error deleting NLQ QA knowledge for splitter"
      );
    }
  }

  async findByQuestion({
    namespace,
    question,
  }: {
    namespace: string;
    question: string;
  }): Promise<TNlqQaKnowledgeOutRequestDto[]> {
    try {
      this.logger.info(
        `[NlqQaKnowledgeAdapter] Finding NLQ QA knowledge by question`,
        {
          namespace,
          question,
        }
      );

      // First, generate the embedding for the question
      const embedding = await this.openaiProvider.generateEmbedding(question);

      // Now, query Pinecone for similar questions
      const { matches } = await this.pineconeProvider
        .getIndex()
        .namespace(namespace)
        .query({
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
      this.logger.info(
        `[NlqQaKnowledgeAdapterError] Found ${results.length} similar questions`,
        {
          results,
        }
      );
      return results;
    } catch (error) {
      this.logger.error(
        "[NlqQaKnowledgeAdapterError] finding NLQ QA knowledge by question",
        {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : null,
          rawError: error,
        }
      );
      throw new Error(
        error.message || "Error finding NLQ QA knowledge by question"
      );
    }
  }
  async findById(id: string): Promise<TNlqQaKnowledgeOutRequestDto | null> {
    try {
      const result = await this.pineconeProvider.getIndex().fetch([id]);
      const record = result?.records?.[id];
      if (!record) {
        return null;
      }
      return record.metadata as unknown as TNlqQaKnowledgeOutRequestDto;
    } catch (error) {
      this.logger.error(
        "[NlqQaKnowledgeAdapter] Error finding NLQ QA knowledge by ID",
        {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : null,
          rawError: error,
        }
      );
      throw new Error(error.message || "Error finding NLQ QA knowledge by ID");
    }
  }
  async findAll(): Promise<TNlqQaKnowledgeOutRequestDto[]> {
    try {
      // Pinecone retrieve everything with embeddings and metadata.
      throw new Error("Method not implemented.");
    } catch (error) {
      this.logger.error(
        "[NlqQaKnowledgeAdapter] Error finding all NLQ QA knowledge",
        {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : null,
          rawError: error,
        }
      );
      throw new Error("Error finding all NLQ QA knowledge");
    }
  }
}
