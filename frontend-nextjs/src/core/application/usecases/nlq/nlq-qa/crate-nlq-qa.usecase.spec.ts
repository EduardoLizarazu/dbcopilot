// src/core/application/usecases/nlq/create-nlq-qa.usecase.spec.ts
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
import { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { CreateNlqQaUseCase } from "./create-nlq-qa.usecase";

/** What each test covers
 * 1. Validation: halts before hitting any ports if the DTO fails Zod validation.
 * 2. Empty prompt: fails with "Prompt template is empty".
 * 3. Empty answer: fails with "Answer generation is empty".
 * 4. Unsafe query: fails with "Generated SQL query is not safe".
 * 5. Suggestion route: when no SQL is generated, extracts suggestion and returns it as an error message.
 * 6. Query execution error: logs and returns error if executeQuery throws.
 * 7. Happy path: generates, validates, executes, creates NLQ QA and returns it.
 */

type DeepPartial<T> = { [K in keyof T]?: any };

// ===== Builder: AJUSTÁ estos campos si tu Zod pide más =====
const makeValidInput = (
  overrides: Partial<{ question: string; createdBy: string }> = {}
) => ({
  question: "How many orders last month?",
  createdBy: "user-123",
  ...overrides,
});

describe("CreateNlqQaUseCase (unit)", () => {
  // Mocks básicos
  const logger: DeepPartial<ILogger> = { info: jest.fn(), error: jest.fn() };

  const repo: DeepPartial<INlqQaRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
  };

  const knowledge: DeepPartial<INlqQaKnowledgePort> = {
    findByQuestion: jest.fn(),
  };

  const info: DeepPartial<INlqQaInformationPort> = {
    extractSchemaBased: jest.fn(),
    executeQuery: jest.fn(),
  };

  const gen: DeepPartial<INlqQaQueryGenerationPort> = {
    createPromptTemplateToGenerateQuery: jest.fn(),
    queryGeneration: jest.fn(),
    extractQueryFromGenerationResponse: jest.fn(),
    safeQuery: jest.fn(),
    extractSuggestionsFromGenerationResponse: jest.fn(),
  };

  const errRepo: DeepPartial<INlqQaErrorRepository> = {
    create: jest.fn(),
  };

  const makeSut = () =>
    new CreateNlqQaUseCase(
      logger as ILogger,
      repo as INlqQaRepository,
      knowledge as INlqQaKnowledgePort,
      info as INlqQaInformationPort,
      gen as INlqQaQueryGenerationPort,
      errRepo as INlqQaErrorRepository
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fail when validation fails", async () => {
    const sut = makeSut();
    const bad = makeValidInput({ question: "", createdBy: "" }); // provoca fallo de zod si min(1)

    const out = await sut.execute(bad as any);

    expect(out.success).toBe(false);
    expect(out.data).toBeNull();
    expect(out.message).toBe("Invalid data");
    expect(knowledge.findByQuestion).not.toHaveBeenCalled();
    expect(gen.createPromptTemplateToGenerateQuery).not.toHaveBeenCalled();
  });

  it("should fail when prompt template is empty", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    (knowledge.findByQuestion as jest.Mock).mockResolvedValue([]);
    (info.extractSchemaBased as jest.Mock).mockResolvedValue([]); // 0 tablas
    (gen.createPromptTemplateToGenerateQuery as jest.Mock).mockResolvedValue({
      promptTemplate: "",
    });

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Prompt template is empty");
  });

  it("should fail when generation returns empty response", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    (knowledge.findByQuestion as jest.Mock).mockResolvedValue([]);
    (info.extractSchemaBased as jest.Mock).mockResolvedValue(["t1"]);
    (gen.createPromptTemplateToGenerateQuery as jest.Mock).mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    (gen.queryGeneration as jest.Mock).mockResolvedValue({ answer: "" });

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Answer generation is empty");
  });

  it("should log and fail if the generated query is NOT safe (isSafe=false)", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    (knowledge.findByQuestion as jest.Mock).mockResolvedValue([{ id: "k1" }]);
    (info.extractSchemaBased as jest.Mock).mockResolvedValue(["t1"]);
    (gen.createPromptTemplateToGenerateQuery as jest.Mock).mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    (gen.queryGeneration as jest.Mock).mockResolvedValue({
      answer: "SQL: SELECT * FROM users;",
    });
    (gen.extractQueryFromGenerationResponse as jest.Mock).mockResolvedValue({
      query: "SELECT * FROM users;",
    });
    (gen.safeQuery as jest.Mock).mockResolvedValue({ isSafe: false }); // <- insegura

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Generated SQL query is not safe");
    expect(errRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        question: dto.question,
        errorMessage: "Generated SQL query is not safe",
        query: "SELECT * FROM users;",
        knowledgeSourceUsedId: ["k1"],
        createdBy: dto.createdBy,
      })
    );
  });

  it("debe tomar la ruta de sugerencias cuando no hay query extraída", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    (knowledge.findByQuestion as jest.Mock).mockResolvedValue([]);
    (info.extractSchemaBased as jest.Mock).mockResolvedValue(["t1"]);
    (gen.createPromptTemplateToGenerateQuery as jest.Mock).mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    (gen.queryGeneration as jest.Mock).mockResolvedValue({
      answer: "No SQL found",
    });
    (gen.extractQueryFromGenerationResponse as jest.Mock).mockResolvedValue({
      query: "",
    }); // <- sin query
    (
      gen.extractSuggestionsFromGenerationResponse as jest.Mock
    ).mockResolvedValue({
      suggestion: "Try narrowing the date range.",
    });

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Try narrowing the date range.");
  });

  it("should log and fail if executeQuery throws", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    (knowledge.findByQuestion as jest.Mock).mockResolvedValue([{ id: "k1" }]);
    (info.extractSchemaBased as jest.Mock).mockResolvedValue(["t1"]);
    (gen.createPromptTemplateToGenerateQuery as jest.Mock).mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    (gen.queryGeneration as jest.Mock).mockResolvedValue({
      answer: "SQL: SELECT 1",
    });
    (gen.extractQueryFromGenerationResponse as jest.Mock).mockResolvedValue({
      query: "SELECT 1",
    });
    (gen.safeQuery as jest.Mock).mockResolvedValue({ isSafe: true });
    (info.executeQuery as jest.Mock).mockRejectedValue(new Error("timeout"));

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(false);
    expect(out.message).toMatch(/timeout/);
    expect(errRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        question: dto.question,
        query: "SELECT 1",
        errorMessage: "timeout",
        knowledgeSourceUsedId: ["k1"],
        createdBy: dto.createdBy,
      })
    );
  });

  it("happy path: generates, validates, executes, creates and returns NLQ QA", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    (knowledge.findByQuestion as jest.Mock).mockResolvedValue([
      { id: "k1" },
      { id: "k2" },
    ]);
    (info.extractSchemaBased as jest.Mock).mockResolvedValue([
      "orders",
      "customers",
    ]);
    (gen.createPromptTemplateToGenerateQuery as jest.Mock).mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    (gen.queryGeneration as jest.Mock).mockResolvedValue({
      answer: "SQL: SELECT * FROM orders",
    });
    (gen.extractQueryFromGenerationResponse as jest.Mock).mockResolvedValue({
      query: "SELECT * FROM orders",
    });
    (gen.safeQuery as jest.Mock).mockResolvedValue({ isSafe: true });
    (info.executeQuery as jest.Mock).mockResolvedValue({ data: [{ id: 1 }] });

    (repo.create as jest.Mock).mockResolvedValue("nlq-1");
    const persisted = {
      id: "nlq-1",
      question: dto.question,
      query: "SELECT * FROM orders",
      isGood: true,
      knowledgeSourceUsedId: ["k1", "k2"],
      createdBy: dto.createdBy,
      updatedBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      userDeleted: false,
      feedbackId: "",
      timeQuestion: new Date(),
      timeQuery: new Date(),
    };
    (repo.findById as jest.Mock).mockResolvedValue(persisted);

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(true);
    expect(out.message).toBe("NLQ QA created successfully");
    expect(out.data).toEqual(persisted);

    expect(knowledge.findByQuestion).toHaveBeenCalledWith(dto.question);
    expect(gen.createPromptTemplateToGenerateQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        question: dto.question,
        similarKnowledgeBased: [{ id: "k1" }, { id: "k2" }],
        schemaBased: ["orders", "customers"],
      })
    );
    expect(info.executeQuery).toHaveBeenCalledWith("SELECT * FROM orders");
    expect(repo.create).toHaveBeenCalled();
    expect(repo.findById).toHaveBeenCalledWith("nlq-1");
  });
});
