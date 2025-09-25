import { CreateNlqQaUseCase } from "./create-nlq-qa.usecase";
import { TNlqQaInRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { NlqQaInformationBuilder } from "@/test/test-utils/builders/nlq-qa-information.builder";
import { NlqQaKnowledgeBuilder } from "@/test/test-utils/builders/nlq-qa-knowledge.builder";
import { NlqQaBuilder } from "@/test/test-utils/builders/nlq-qa.builder";
import {
  errRepoMock,
  genQueryPortMock,
  infoPortMock,
  knowledgePortMock,
  loggerMock,
  nlqQaRepoMock,
} from "@/test/test-utils/mocks/repo.mocks";

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
  // Mocks
  // 1) Instanciá mocks “fresh” en cada test
  const makeDeps = () => {
    const logger = loggerMock();
    const repo = nlqQaRepoMock();
    const errRepo = errRepoMock();
    const info = infoPortMock();
    const knowledge = knowledgePortMock();
    const gen = genQueryPortMock();
    const sut = new CreateNlqQaUseCase(
      logger,
      repo,
      knowledge,
      info,
      gen,
      errRepo
    );
    return { sut, logger, repo, errRepo, info, knowledge, gen };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1) Validation: corta con "Invalid data"', async () => {
    const { sut, knowledge, gen } = makeDeps();
    const bad = NlqQaBuilder.makeInRequest({ question: "", createdBy: "" });

    const out = await sut.execute(bad);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Invalid data");
    expect(knowledge.findByQuestion).not.toHaveBeenCalled();
    expect(gen.createPromptTemplateToGenerateQuery).not.toHaveBeenCalled();
  });

  it("2) Prompt template vacío", async () => {
    const { sut, knowledge, info, gen } = makeDeps();
    const dto = NlqQaBuilder.makeInRequest();

    knowledge.findByQuestion.mockResolvedValue([]);
    info.extractSchemaBased.mockResolvedValue(
      NlqQaInformationBuilder.makeSchemaExtraction()
    );
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "",
    });

    const out = await sut.execute(dto);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Prompt template is empty");
  });

  it("3) Answer vacía", async () => {
    const { sut, knowledge, info, gen } = makeDeps();
    const dto = NlqQaBuilder.makeInRequest();

    knowledge.findByQuestion.mockResolvedValue(
      NlqQaKnowledgeBuilder.makeList(0) // []
    );
    info.extractSchemaBased.mockResolvedValue(
      NlqQaInformationBuilder.makeSchemaExtraction()
    );
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT",
    });
    gen.queryGeneration.mockResolvedValue({ answer: "" });

    const out = await sut.execute(dto);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Answer generation is empty");
  });

  it("4) Query insegura -> registra error y falla", async () => {
    const { sut, knowledge, info, gen, errRepo } = makeDeps();
    const dto = NlqQaBuilder.makeInRequest();

    knowledge.findByQuestion.mockResolvedValue([
      NlqQaKnowledgeBuilder.makeOut({ id: "k1" }),
    ]);
    info.extractSchemaBased.mockResolvedValue(
      NlqQaInformationBuilder.makeSchemaExtraction()
    );
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT",
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
    });

    const out = await sut.execute(dto);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Generated SQL query is not safe");
    expect(errRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        question: dto.question,
        query: "DELETE * FROM users",
        errorMessage: "Generated SQL query is not safe",
        knowledgeSourceUsedId: ["k1"],
        createdBy: dto.createdBy,
      })
    );
  });

  it("5) Ruta de sugerencias cuando no hay query", async () => {
    const { sut, knowledge, info, gen } = makeDeps();
    const dto = NlqQaBuilder.makeInRequest();

    knowledge.findByQuestion.mockResolvedValue([]);
    info.extractSchemaBased.mockResolvedValue(
      NlqQaInformationBuilder.makeSchemaExtraction()
    );
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT",
    });
    gen.queryGeneration.mockResolvedValue({ answer: "no sql" });
    gen.extractQueryFromGenerationResponse.mockResolvedValue({ query: "" });
    gen.extractSuggestionsFromGenerationResponse.mockResolvedValue({
      suggestion: "Try narrowing the date range.",
    });

    const out = await sut.execute(dto);

    expect(out.success).toBe(false);
    expect(out.message).toBe("Try narrowing the date range.");
  });

  it("6) executeQuery lanza -> registra error y falla", async () => {
    const { sut, knowledge, info, gen, errRepo } = makeDeps();
    const dto = NlqQaBuilder.makeInRequest();

    knowledge.findByQuestion.mockResolvedValue([
      NlqQaKnowledgeBuilder.makeOut({ id: "k1" }),
    ]);
    info.extractSchemaBased.mockResolvedValue(
      NlqQaInformationBuilder.makeSchemaExtraction()
    );
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT",
    });
    gen.queryGeneration.mockResolvedValue({ answer: "SQL: SELECT 1" });
    gen.extractQueryFromGenerationResponse.mockResolvedValue({
      query: "SELECT 1",
    });
    gen.safeQuery.mockResolvedValue({ query: "SELECT 1", isSafe: true });
    info.executeQuery.mockRejectedValue(new Error("timeout"));

    const out = await sut.execute(dto);

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

  it("7) Happy path", async () => {
    const { sut, knowledge, info, gen, repo } = makeDeps();
    const dto = NlqQaBuilder.makeInRequest();

    knowledge.findByQuestion.mockResolvedValue(
      NlqQaKnowledgeBuilder.makeList(2, {}) // [{id:'kn-1'},{id:'kn-2'}...]
    );
    info.extractSchemaBased.mockResolvedValue(
      NlqQaInformationBuilder.makeSchemaExtraction({
        TABLE_SCHEMA: "TABLE_SCHEMA",
        TABLE_NAME: "orders",
        COLUMN_NAME: "id",
        DATA_TYPE: "number",
      })
    );
    gen.createPromptTemplateToGenerateQuery.mockResolvedValue({
      promptTemplate: "PROMPT",
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
    info.executeQuery.mockResolvedValue(
      NlqQaInformationBuilder.makeInformationData({ data: [{ id: 1 }] })
    );

    repo.create.mockResolvedValue("nlq-1");
    const persisted = NlqQaBuilder.makeOut({
      id: "nlq-1",
      question: dto.question,
      query: "SELECT * FROM orders",
      knowledgeSourceUsedId: ["kn-1", "kn-2"],
    });
    repo.findById.mockResolvedValue(persisted);

    const out = await sut.execute(dto);

    expect(out.success).toBe(true);
    expect(out.message).toBe("NLQ QA created successfully");
    expect(out.data).toEqual(persisted);
  });
});
