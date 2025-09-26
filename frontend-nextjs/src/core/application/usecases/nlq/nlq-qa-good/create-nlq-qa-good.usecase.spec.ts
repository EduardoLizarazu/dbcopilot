import { CreateNlqQaGoodUseCase } from "./create-nlq-qa-good.usecase";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";
import { INlqQaTopologyGenerationPort } from "../../../ports/nlq-qa-topology-generation.port";
import { INlqQaKnowledgePort } from "../../../ports/nlq-qa-knowledge.app.inter";
import { NlqQaGoodBuilder } from "@/test/test-utils/builders/nlq-qa-good.builder";

describe("CreateNlqQaGoodUseCase", () => {
  let useCase: CreateNlqQaGoodUseCase;
  let mockLogger: jest.Mocked<ILogger>;
  let mockRepository: jest.Mocked<INlqQaGoodRepository>;
  let mockTopologyGenPort: jest.Mocked<INlqQaTopologyGenerationPort>;
  let mockKnowledgePort: jest.Mocked<INlqQaKnowledgePort>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as any;

    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockTopologyGenPort = {
      genDetailQuestion: jest.fn(),
      genTablesColumns: jest.fn(),
      genSemanticFields: jest.fn(),
      genSemanticTables: jest.fn(),
      genFlags: jest.fn(),
      genThinkProcess: jest.fn(),
    } as any;

    mockKnowledgePort = {
      create: jest.fn(),
    } as any;

    useCase = new CreateNlqQaGoodUseCase(
      mockLogger,
      mockRepository,
      mockTopologyGenPort,
      mockKnowledgePort
    );
  });

  it("should create NLQ QA Good successfully", async () => {
    const mockInput = NlqQaGoodBuilder.makeInRequest();
    const mockCreateDto = NlqQaGoodBuilder.makeCreate();
    const mockOutput = NlqQaGoodBuilder.makeOut();

    mockTopologyGenPort.genDetailQuestion.mockResolvedValue({
      detailQuestion: mockCreateDto.detailQuestion,
    });
    mockTopologyGenPort.genTablesColumns.mockResolvedValue({
      tablesColumns: mockCreateDto.tablesColumns,
    });
    mockTopologyGenPort.genSemanticFields.mockResolvedValue({
      semanticFields: mockCreateDto.semanticFields.map((f) => ({
        field: f.field ?? "",
        purpose: f.purpose ?? "",
      })),
    });
    mockTopologyGenPort.genSemanticTables.mockResolvedValue({
      semanticTables: mockCreateDto.semanticTables.map((t) => ({
        table: t.table ?? "",
        purpose: t.purpose ?? "",
      })),
    });
    mockTopologyGenPort.genFlags.mockResolvedValue({
      flags: mockCreateDto.flags.map((f) => ({
        field: f.field ?? "",
        flag: f.flag ?? "",
      })),
    });
    mockTopologyGenPort.genThinkProcess.mockResolvedValue({
      think: mockCreateDto.think,
    });

    mockRepository.create.mockResolvedValue(mockOutput.id);
    mockRepository.findById.mockResolvedValue(mockOutput);
    mockKnowledgePort.create.mockResolvedValue("ks-123");

    const result = await useCase.execute(mockInput);

    expect(result.success).toBe(true);
    expect(result.message).toBe("NLQ QA Good created successfully");
    expect(result.data).toEqual(mockOutput);

    expect(mockTopologyGenPort.genDetailQuestion).toHaveBeenCalledWith({
      question: mockInput.question,
      query: mockInput.query,
    });
    expect(mockTopologyGenPort.genTablesColumns).toHaveBeenCalledWith({
      query: mockInput.query,
    });
    expect(mockTopologyGenPort.genSemanticFields).toHaveBeenCalledWith({
      question: mockCreateDto.detailQuestion,
      query: mockInput.query,
    });
    expect(mockTopologyGenPort.genSemanticTables).toHaveBeenCalledWith({
      question: mockCreateDto.detailQuestion,
      query: mockInput.query,
    });
    expect(mockTopologyGenPort.genFlags).toHaveBeenCalledWith({
      question: mockCreateDto.detailQuestion,
      query: mockInput.query,
    });
    expect(mockTopologyGenPort.genThinkProcess).toHaveBeenCalledWith({
      question: mockCreateDto.detailQuestion,
      query: mockInput.query,
    });

    expect(mockRepository.create).toHaveBeenCalledWith({
      ...mockCreateDto,
      knowledgeSourceId: "",
      isOnKnowledgeSource: false,
      updatedBy: mockInput.createdBy,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      isDelete: false,
    });
    expect(mockKnowledgePort.create).toHaveBeenCalledWith({
      question: mockInput.question,
      query: mockInput.query,
      nlqQaGoodId: mockOutput.id,
      id: mockOutput.id,
      tablesColumns: mockCreateDto.tablesColumns,
    });
    expect(mockRepository.findById).toHaveBeenCalledWith(mockOutput.id);
  });

  it("should return error when input validation fails", async () => {
    const mockInput = NlqQaGoodBuilder.makeInRequest({ question: "" });

    const result = await useCase.execute(mockInput);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Invalid input data");
    expect(result.data).toBeNull();

    expect(mockTopologyGenPort.genDetailQuestion).not.toHaveBeenCalled();
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockKnowledgePort.create).not.toHaveBeenCalled();
  });

  it("should return error when creation fails", async () => {
    const mockInput = NlqQaGoodBuilder.makeInRequest();
    const mockCreateDto = NlqQaGoodBuilder.makeCreate();

    mockTopologyGenPort.genDetailQuestion.mockResolvedValue({
      detailQuestion: mockCreateDto.detailQuestion,
    });
    mockTopologyGenPort.genTablesColumns.mockResolvedValue({
      tablesColumns: mockCreateDto.tablesColumns,
    });
    mockTopologyGenPort.genSemanticFields.mockResolvedValue({
      semanticFields: mockCreateDto.semanticFields.map((f) => ({
        field: f.field ?? "",
        purpose: f.purpose ?? "",
      })),
    });
    mockTopologyGenPort.genSemanticTables.mockResolvedValue({
      semanticTables: mockCreateDto.semanticTables.map((t) => ({
        table: t.table ?? "",
        purpose: t.purpose ?? "",
      })),
    });
    mockTopologyGenPort.genFlags.mockResolvedValue({
      flags: mockCreateDto.flags.map((f) => ({
        field: f.field ?? "",
        flag: f.flag ?? "",
      })),
    });
    mockTopologyGenPort.genThinkProcess.mockResolvedValue({
      think: mockCreateDto.think,
    });

    mockRepository.create.mockResolvedValue(null);

    const result = await useCase.execute(mockInput);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to create NLQ QA Good");
    expect(result.data).toBeNull();

    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockKnowledgePort.create).not.toHaveBeenCalled();
  });
});
