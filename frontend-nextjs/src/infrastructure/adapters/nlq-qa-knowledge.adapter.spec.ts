// src/test/unit/nlq-qa-knowledge.adapter.spec.ts
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { NlqQaKnowledgeAdapter } from "./nlq-qa-knowledge.adapter";
import { WinstonLoggerProvider } from "../providers/logging/winstom-logger.infra.provider";
import { TCreateNlqQaKnowledgeDto } from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";

describe("NlqQaKnowledgeAdapter (integration)", () => {
  const logger: ILogger = new WinstonLoggerProvider();
  const pineconeProvider = new PineconeProvider(); // Use the real PineconeProvider
  const openaiProvider = new OpenAIProvider(); // Use the real OpenAIProvider

  const makeSut = () =>
    new NlqQaKnowledgeAdapter(logger, pineconeProvider, openaiProvider);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create -> generates embedding and uploads to Pinecone; returns id", async () => {
    const sut = makeSut();

    const dto: TCreateNlqQaKnowledgeDto = {
      id: "k1",
      nlqQaGoodId: "g1",
      question: "How many orders?",
      query: "SELECT COUNT(*) FROM orders",
      tablesColumns: ["orders.id"],
    };

    const id = await sut.create(dto);

    expect(id).toBe("k1");
  });

  it("update -> re-embedding and upserts to the same id", async () => {
    const sut = makeSut();

    await sut.update("k1", {
      nlqQaGoodId: "g2",
      question: "New Q",
      query: "SELECT 1",
      tablesColumns: ["x.y"],
    } as TCreateNlqQaKnowledgeDto);
  });

  it("delete -> calls deleteOne on the index", async () => {
    const sut = makeSut();
    await sut.delete("k1");
  });

  it("findByQuestion -> generates embedding, queries, maps matches to DTO", async () => {
    const sut = makeSut();

    const out = await sut.findByQuestion("orders last month?");
    expect(out).toBeDefined();
  });

  it("findById -> maps record.metadata to DTO; null if not found", async () => {
    const sut = makeSut();

    const r1 = await sut.findById("k1");
    expect(r1).toBeDefined();

    const r2 = await sut.findById("missing");
    expect(r2).toBeNull();
  });
});
