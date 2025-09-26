import { CreateNlqQaFeedbackUseCase } from "./create-nlq-qa-feedbcak.usecase";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaFeedbackRepository } from "../../../interfaces/nlq/nlq-qa-feedback.app.inter";
import { INlqQaRepository } from "../../../interfaces/nlq/nlq-qa.app.inter";
import { NlqQaFeedbackBuilder } from "@/test/test-utils/builders/nlq-qa-feedback.builder";

const mockLogger: jest.Mocked<ILogger> = {
  info: jest.fn(),
  error: jest.fn(),
} as any;

const mockNlqQaFeedbackRepository: jest.Mocked<INlqQaFeedbackRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
} as any;

const mockNlqQaRepository: jest.Mocked<INlqQaRepository> = {
  findById: jest.fn(),
  update: jest.fn(),
} as any;

describe("CreateNlqQaFeedbackUseCase", () => {
  let useCase: CreateNlqQaFeedbackUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateNlqQaFeedbackUseCase(
      mockLogger,
      mockNlqQaFeedbackRepository,
      mockNlqQaRepository
    );
  });

  it("should return success when feedback is created successfully", async () => {
    const mockData = NlqQaFeedbackBuilder.makeCreateDto();
    const mockFeedback = NlqQaFeedbackBuilder.makeOut({
      id: "mock-feedback-id",
    });
    const mockNlqQa = {
      id: mockData.nlqQaId,
      feedbackId: null,
      isGood: null,
    };

    mockNlqQaRepository.findById.mockResolvedValue(mockNlqQa);
    mockNlqQaFeedbackRepository.create.mockResolvedValue(mockFeedback.id);
    mockNlqQaFeedbackRepository.findById.mockResolvedValue(mockFeedback);

    const result = await useCase.execute(mockData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Nlq Qa Feedback created successfully");
    expect(result.data).toEqual(mockFeedback);

    expect(mockNlqQaRepository.findById).toHaveBeenCalledWith(mockData.nlqQaId);
    expect(mockNlqQaFeedbackRepository.create).toHaveBeenCalledWith(mockData);
    expect(mockNlqQaFeedbackRepository.findById).toHaveBeenCalledWith(
      mockFeedback.id
    );
    expect(mockNlqQaRepository.update).toHaveBeenCalledWith(mockData.nlqQaId, {
      ...mockNlqQa,
      feedbackId: mockFeedback.id,
      isGood: mockData.isGood,
      updatedAt: expect.any(Date),
      updatedBy: mockData.createdBy,
    });
  });

  it("should return error when NLQ QA is not found", async () => {
    const mockData = NlqQaFeedbackBuilder.makeCreateDto({
      nlqQaId: "non-existent-id",
    });

    mockNlqQaRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(mockData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("NLQ QA not found");
    expect(result.data).toBeNull();

    expect(mockNlqQaRepository.findById).toHaveBeenCalledWith(mockData.nlqQaId);
    expect(mockNlqQaFeedbackRepository.create).not.toHaveBeenCalled();
    expect(mockNlqQaFeedbackRepository.findById).not.toHaveBeenCalled();
    expect(mockNlqQaRepository.update).not.toHaveBeenCalled();
  });

  it("should return error when feedback creation fails", async () => {
    const mockData = NlqQaFeedbackBuilder.makeCreateDto();
    const mockNlqQa = {
      id: mockData.nlqQaId,
      feedbackId: null,
      isGood: null,
    };

    mockNlqQaRepository.findById.mockResolvedValue(mockNlqQa);
    mockNlqQaFeedbackRepository.create.mockRejectedValue(
      new Error("Create failed")
    );

    const result = await useCase.execute(mockData);

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error creating NLQ QA feedback");
    expect(result.data).toBeNull();

    expect(mockNlqQaRepository.findById).toHaveBeenCalledWith(mockData.nlqQaId);
    expect(mockNlqQaFeedbackRepository.create).toHaveBeenCalledWith(mockData);
    expect(mockNlqQaFeedbackRepository.findById).not.toHaveBeenCalled();
    expect(mockNlqQaRepository.update).not.toHaveBeenCalled();
  });
});
