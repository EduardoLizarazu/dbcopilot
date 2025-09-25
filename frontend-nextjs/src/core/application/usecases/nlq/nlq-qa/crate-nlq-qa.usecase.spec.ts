// src/core/application/usecases/nlq/create-nlq-qa.usecase.spec.ts
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
import { INlqQaInformationPort } from "@/core/application/ports/nlq-qa-information.port";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { CreateNlqQaUseCase } from "./create-nlq-qa.usecase";
import { TNlqQaInRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";

/** What each test covers
 * 1. Validation: halts before hitting any ports if the DTO fails Zod validation.
 * 2. Empty prompt: fails with "Prompt template is empty".
 * 3. Empty answer: fails with "Answer generation is empty".
 * 4. Unsafe query: fails with "Generated SQL query is not safe".
 * 5. Suggestion route: when no SQL is generated, extracts suggestion and returns it as an error message.
 * 6. Query execution error: logs and returns error if executeQuery throws.
 * 7. Happy path: generates, validates, executes, creates NLQ QA and returns it.
 */

/** Builder: AJUSTÁ estos campos si tu Zod pide más */
const makeValidInput = (
  over: Partial<TNlqQaInRequestDto> = {}
): TNlqQaInRequestDto => ({
  question: "How many orders last month?",
  createdBy: "user-123",
  ...over,
});

describe("CreateNlqQaUseCase (unit)", () => {
  // Mocks básicos
  const logger: jest.Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
  } as any;

  // Repositorios/puertos: tipar CADA método con MockedFunction<Interface['metodo']>
  const repo = {
    create: jest.fn() as jest.MockedFunction<INlqQaRepository["create"]>,
    findById: jest.fn() as jest.MockedFunction<INlqQaRepository["findById"]>,
  } as unknown as jest.Mocked<INlqQaRepository>;

  const knowledge = {
    findByQuestion: jest.fn() as jest.MockedFunction<
      INlqQaKnowledgePort["findByQuestion"]
    >,
  } as unknown as jest.Mocked<INlqQaKnowledgePort>;

  const info = {
    extractSchemaBased: jest.fn() as jest.MockedFunction<
      INlqQaInformationPort["extractSchemaBased"]
    >,
    executeQuery: jest.fn() as jest.MockedFunction<
      INlqQaInformationPort["executeQuery"]
    >,
  } as unknown as jest.Mocked<INlqQaInformationPort>;

  const gen = {
    createPromptTemplateToGenerateQuery: jest.fn() as jest.MockedFunction<
      INlqQaQueryGenerationPort["createPromptTemplateToGenerateQuery"]
    >,
    queryGeneration: jest.fn() as jest.MockedFunction<
      INlqQaQueryGenerationPort["queryGeneration"]
    >,
    extractQueryFromGenerationResponse: jest.fn() as jest.MockedFunction<
      INlqQaQueryGenerationPort["extractQueryFromGenerationResponse"]
    >,
    safeQuery: jest.fn() as jest.MockedFunction<
      INlqQaQueryGenerationPort["safeQuery"]
    >,
    extractSuggestionsFromGenerationResponse: jest.fn() as jest.MockedFunction<
      INlqQaQueryGenerationPort["extractSuggestionsFromGenerationResponse"]
    >,
  } as unknown as jest.Mocked<INlqQaQueryGenerationPort>;

  const errRepo = {
    create: jest.fn() as jest.MockedFunction<INlqQaErrorRepository["create"]>,
  } as unknown as jest.Mocked<INlqQaErrorRepository>;

  const makeSut = () =>
    new CreateNlqQaUseCase(logger, repo, knowledge, info, gen, errRepo);

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

    knowledge.findByQuestion.mockResolvedValue([]);
    info.extractSchemaBased.mockResolvedValue([]); // 0 tablas
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "",
    });

    const out = await sut.execute(dto);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Prompt template is empty");
  });

  it("should fail when generation returns empty response", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    knowledge.findByQuestion.mockResolvedValue([]);
    info.extractSchemaBased.mockResolvedValue([
      {
        TABLE_SCHEMA: "TABLE_SCHEMA",
        TABLE_NAME: "",
        COLUMN_NAME: "",
        DATA_TYPE: "",
        DATA_LENGTH: 0,
        DATA_PRECISION: 0,
        DATA_SCALE: 0,
        NULLABLE: "",
        IS_PRIMARY_KEY: "",
        IS_FOREIGN_KEY: "",
        REFERENCED_TABLE_SCHEMA: null,
        REFERENCED_TABLE_NAME: null,
        REFERENCED_COLUMN_NAME: null,
      },
    ]);
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    gen.queryGeneration.mockResolvedValue({ answer: "" });

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Answer generation is empty");
  });

  it("should log and fail if the generated query is NOT safe (isSafe=false)", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    knowledge.findByQuestion.mockResolvedValue([
      {
        id: "k1",
        question: "question",
        query: "SELECT * FROM users",
        nlqQaGoodId: "g1",
        tablesColumns: ["orders.id"],
        score: 0,
      },
    ]);
    info.extractSchemaBased.mockResolvedValue([
      {
        TABLE_SCHEMA: "TABLE_SCHEMA",
        TABLE_NAME: "",
        COLUMN_NAME: "",
        DATA_TYPE: "",
        DATA_LENGTH: 0,
        DATA_PRECISION: 0,
        DATA_SCALE: 0,
        NULLABLE: "",
        IS_PRIMARY_KEY: "",
        IS_FOREIGN_KEY: "",
        REFERENCED_TABLE_SCHEMA: null,
        REFERENCED_TABLE_NAME: null,
        REFERENCED_COLUMN_NAME: null,
      },
    ]);
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    gen.queryGeneration.mockResolvedValue({
      answer: "SQL: DELETE * FROM users",
    });
    gen.extractQueryFromGenerationResponse.mockResolvedValue({
      query: "DELETE * FROM users",
    });
    gen.safeQuery.mockResolvedValue({
      query: "DELETE * FROM users",
      isSafe: false,
    }); // <- insegura

    const out = await sut.execute(dto);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Generated SQL query is not safe");
    expect(errRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        question: dto.question,
        errorMessage: "Generated SQL query is not safe",
        query: "DELETE * FROM users",
        knowledgeSourceUsedId: ["k1"],
        createdBy: dto.createdBy,
      })
    );
  });

  it("debe tomar la ruta de sugerencias cuando no hay query extraída", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    knowledge.findByQuestion.mockResolvedValue([]);
    info.extractSchemaBased.mockResolvedValue([]);
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    gen.queryGeneration.mockResolvedValue({
      answer: "No SQL found",
    });
    gen.extractQueryFromGenerationResponse.mockResolvedValue({
      query: "",
    }); // <- sin query
    gen.extractSuggestionsFromGenerationResponse.mockResolvedValue({
      suggestion: "Try narrowing the date range.",
    });

    const out = await sut.execute(dto);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Try narrowing the date range.");
  });

  it("should log and fail if executeQuery throws", async () => {
    const sut = makeSut();
    const dto = makeValidInput();

    knowledge.findByQuestion.mockResolvedValue([
      {
        id: "k1",
        question: "",
        query: "",
        nlqQaGoodId: "",
        tablesColumns: [],
        score: 0,
      },
    ]);
    info.extractSchemaBased.mockResolvedValue([]);
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    gen.queryGeneration.mockResolvedValue({
      answer: "SQL: SELECT 1",
    });
    gen.extractQueryFromGenerationResponse.mockResolvedValue({
      query: "SELECT 1",
    });
    gen.safeQuery.mockResolvedValue({ query: "SELECT 1", isSafe: true });
    info.executeQuery.mockRejectedValue(new Error("timeout"));

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

    knowledge.findByQuestion.mockResolvedValue([
      {
        id: "k1",
        question: "question 1",
        nlqQaGoodId: "nqlqg1",
        query: "select * from orders",
        tablesColumns: [],
        score: 0,
      },
      {
        id: "k2",
        question: "question 2",
        query: "select * from customers",
        nlqQaGoodId: "nqlqg2",
        tablesColumns: [],
        score: 0,
      },
    ]);
    info.extractSchemaBased.mockResolvedValue([
      {
        TABLE_SCHEMA: "TABLE_SCHEMA",
        TABLE_NAME: "orders",
        COLUMN_NAME: "id",
        DATA_TYPE: "number",
        DATA_LENGTH: 0,
        DATA_PRECISION: 10,
        DATA_SCALE: 0,
        NULLABLE: "NO",
        IS_PRIMARY_KEY: "YES",
        IS_FOREIGN_KEY: "NO",
        REFERENCED_TABLE_SCHEMA: null,
        REFERENCED_TABLE_NAME: null,
        REFERENCED_COLUMN_NAME: null,
      },
    ]);
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT...",
    });
    gen.queryGeneration.mockResolvedValue({
      answer: "SQL: SELECT * FROM orders",
    });
    gen.extractQueryFromGenerationResponse.mockResolvedValue({
      query: "SELECT * FROM orders",
    });
    gen.safeQuery.mockResolvedValue({
      query: "SELECT * FROM orders",
      isSafe: true,
    });
    info.executeQuery.mockResolvedValue({ data: [{ id: 1 }] });

    repo.create.mockResolvedValue("nlq-1");
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
    repo.findById.mockResolvedValue(persisted);

    const out = await sut.execute(dto as any);

    expect(out.success).toBe(true);
    expect(out.message).toBe("NLQ QA created successfully");
    expect(out.data).toEqual(persisted);

    expect(knowledge.findByQuestion).toHaveBeenCalledWith(dto.question);
    expect(gen.createPromptTemplateToGenerateQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        question: dto.question,
        similarKnowledgeBased: [
          {
            id: "k1",
            question: "question 1",
            nlqQaGoodId: "nqlqg1",
            query: "select * from orders",
            tablesColumns: [],
            score: 0,
          },
          {
            id: "k2",
            question: "question 2",
            query: "select * from customers",
            nlqQaGoodId: "nqlqg2",
            tablesColumns: [],
            score: 0,
          },
        ],
        schemaBased: [
          {
            TABLE_SCHEMA: "TABLE_SCHEMA",
            TABLE_NAME: "orders",
            COLUMN_NAME: "id",
            DATA_TYPE: "number",
            DATA_LENGTH: 0,
            DATA_PRECISION: 10,
            DATA_SCALE: 0,
            NULLABLE: "NO",
            IS_PRIMARY_KEY: "YES",
            IS_FOREIGN_KEY: "NO",
            REFERENCED_TABLE_SCHEMA: null,
            REFERENCED_TABLE_NAME: null,
            REFERENCED_COLUMN_NAME: null,
          },
        ],
      })
    );
    expect(info.executeQuery).toHaveBeenCalledWith("SELECT * FROM orders");
    expect(repo.create).toHaveBeenCalled();
    expect(repo.findById).toHaveBeenCalledWith("nlq-1");
  });
});
