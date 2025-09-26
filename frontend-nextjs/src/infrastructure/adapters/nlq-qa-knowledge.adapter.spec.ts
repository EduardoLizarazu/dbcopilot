// src/test/unit/nlq-qa-knowledge.adapter.spec.ts
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import type { PineconeProvider } from "@/infrastructure/providers/vector/pinecone";
import type { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { NlqQaKnowledgeAdapter } from "./nlq-qa-knowledge.adapter";
// import { NlqQaKnowledgeBuilder } from "@/test-utils/builders/nlqQaKnowledge.builder";

describe("NlqQaKnowledgeAdapter (unit)", () => {
  const logger: jest.Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn() as any,
  } as any;

  // ------- Mocks Pinecone -------
  const index = {
    upsert: jest.fn(),
    deleteOne: jest.fn(),
    query: jest.fn(),
    fetch: jest.fn(),
  };
  const pineconeProvider = {
    getIndex: () => index,
    upload: jest.fn(), // usado en create()
  } as unknown as jest.Mocked<PineconeProvider>;

  // ------- Mock OpenAI (embeddings) -------
  const openaiProvider = {
    generateEmbedding: jest.fn(),
  } as unknown as jest.Mocked<OpenAIProvider>;

  const makeSut = () =>
    new NlqQaKnowledgeAdapter(logger, pineconeProvider, openaiProvider);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create -> genera embedding y sube a Pinecone; retorna id", async () => {
    const sut = makeSut();
    openaiProvider.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3] as any);

    const dto /* = NlqQaKnowledgeBuilder.makeCreate(...) */ = {
      id: "k1",
      nlqQaGoodId: "g1",
      question: "How many orders?",
      query: "SELECT COUNT(*) FROM orders",
      tablesColumns: ["orders.id"],
    };

    const id = await sut.create(dto as any);

    expect(openaiProvider.generateEmbedding).toHaveBeenCalledWith(dto.question);
    expect(pineconeProvider.upload).toHaveBeenCalledWith({
      id: "k1",
      embedding: [0.1, 0.2, 0.3],
      metadata: {
        question: "How many orders?",
        answer: "SELECT COUNT(*) FROM orders",
        tablesColumns: ["orders.id"],
        nlqQaGoodId: "g1",
      },
    });
    expect(id).toBe("k1");
  });

  it("create -> path de error: log y throw", async () => {
    const sut = makeSut();
    openaiProvider.generateEmbedding.mockRejectedValue(
      new Error("openai down")
    );

    await expect(
      sut.create({
        id: "k1",
        nlqQaGoodId: "g1",
        question: "Q",
        query: "A",
        tablesColumns: ["t.c"],
      } as any)
    ).rejects.toThrow(/Error creating NLQ QA knowledge/);
    expect(logger.error).toHaveBeenCalled();
  });

  it("update -> re-embedding y upsert al mismo id", async () => {
    const sut = makeSut();
    openaiProvider.generateEmbedding.mockResolvedValue([0.5, 0.6] as any);

    await sut.update("k1", {
      nlqQaGoodId: "g2",
      question: "New Q",
      query: "SELECT 1",
      tablesColumns: ["x.y"],
    } as any);

    expect(openaiProvider.generateEmbedding).toHaveBeenCalledWith("New Q");
    expect(index.upsert).toHaveBeenCalledWith([
      {
        id: "k1",
        values: [0.5, 0.6],
        metadata: {
          question: "New Q",
          answer: "SELECT 1",
          tablesColumns: ["x.y"],
          nlqQaGoodId: "g2",
        },
      },
    ]);
  });

  it("update -> path de error: log y throw", async () => {
    const sut = makeSut();
    openaiProvider.generateEmbedding.mockResolvedValue([1, 2] as any);
    index.upsert.mockRejectedValue(new Error("upsert fail"));

    await expect(
      sut.update("k1", {
        nlqQaGoodId: "g2",
        question: "Q",
        query: "A",
        tablesColumns: ["t.c"],
      } as any)
    ).rejects.toThrow(/Error updating NLQ QA knowledge/);
    expect(logger.error).toHaveBeenCalled();
  });

  it("delete -> llama a deleteOne en el índice", async () => {
    const sut = makeSut();
    await sut.delete("k1");
    expect(index.deleteOne).toHaveBeenCalledWith("k1");
  });

  it("delete -> path de error: log y throw", async () => {
    const sut = makeSut();
    index.deleteOne.mockRejectedValue(new Error("del fail"));
    await expect(sut.delete("k1")).rejects.toThrow(
      /Error deleting NLQ QA knowledge/
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it("findByQuestion -> genera embedding, consulta, mapea matches a DTO", async () => {
    const sut = makeSut();
    openaiProvider.generateEmbedding.mockResolvedValue([0.1, 0.2] as any);
    index.query.mockResolvedValue({
      matches: [
        {
          id: "k1",
          score: 0.88,
          metadata: {
            question: "How many orders?",
            answer: "SELECT COUNT(*) FROM orders",
            tablesColumns: ["orders.id", "orders.date"],
            nlqQaGoodId: "g1",
            nlqQaGoodDetailsId: "gd1",
          },
        },
        {
          id: "k2",
          score: 0.7,
          metadata: {
            question: "How many customers?",
            answer: "SELECT COUNT(*) FROM customers",
            tablesColumns: "customers.id", // string único -> array
            nlqQaGoodId: "g2",
          },
        },
      ],
    });

    const out = await sut.findByQuestion("orders last month?");
    expect(openaiProvider.generateEmbedding).toHaveBeenCalledWith(
      "orders last month?"
    );
    expect(index.query).toHaveBeenCalledWith({
      vector: [0.1, 0.2],
      topK: 5,
      includeMetadata: true,
    });

    expect(out).toEqual([
      {
        id: "k1",
        nlqQaGoodDetailsId: "gd1",
        nlqQaGoodId: "g1",
        question: "How many orders?",
        query: "SELECT COUNT(*) FROM orders",
        tablesColumns: ["orders.id", "orders.date"],
        score: 0.88,
      },
      {
        id: "k2",
        nlqQaGoodDetailsId: "", // faltaba -> string vacío
        nlqQaGoodId: "g2",
        question: "How many customers?",
        query: "SELECT COUNT(*) FROM customers",
        tablesColumns: ["customers.id"], // normalizado a array
        score: 0.7,
      },
    ]);
  });

  it("findByQuestion -> path de error: log y throw", async () => {
    const sut = makeSut();
    openaiProvider.generateEmbedding.mockResolvedValue([0.1] as any);
    index.query.mockRejectedValue(new Error("query fail"));

    await expect(sut.findByQuestion("Q")).rejects.toThrow(
      /Error finding NLQ QA knowledge by question/
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it("findById -> mapea record.metadata a DTO; null si no existe", async () => {
    const sut = makeSut();
    index.fetch.mockResolvedValue({
      records: {
        k1: {
          id: "k1",
          values: [0.1, 0.2],
          metadata: {
            id: "k1",
            nlqQaGoodId: "g1",
            question: "Q",
            query: "A",
            tablesColumns: ["t.c"],
            score: 0.9,
          },
        },
      },
    });

    const r1 = await sut.findById("k1");
    expect(index.fetch).toHaveBeenCalledWith(["k1"]);
    expect(r1).toEqual({
      id: "k1",
      nlqQaGoodId: "g1",
      question: "Q",
      query: "A",
      tablesColumns: ["t.c"],
      score: 0.9,
    });

    index.fetch.mockResolvedValue({ records: {} });
    const r2 = await sut.findById("missing");
    expect(r2).toBeNull();
  });

  it("findById -> path de error: log y throw", async () => {
    const sut = makeSut();
    index.fetch.mockRejectedValue(new Error("fetch fail"));
    await expect(sut.findById("k1")).rejects.toThrow(
      /Error finding NLQ QA knowledge by ID/
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it("findAll -> actualmente lanza 'Method not implemented.' y envuelve en error", async () => {
    const sut = makeSut();
    await expect(sut.findAll()).rejects.toThrow(
      /Error finding all NLQ QA knowledge/
    );
    expect(logger.error).toHaveBeenCalled();
  });
});
