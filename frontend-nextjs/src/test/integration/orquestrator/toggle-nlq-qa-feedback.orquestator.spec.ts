import { ToggleNlqQaFeedbackOrchestrator } from "@/core/application/orquestrator/toggle-nlq-qa-feedback.orquestator";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { NlqQaFeedbackBuilder } from "@/test/test-utils/builders/nlq-qa-feedback.builder";
import { CreateNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/create-nlq-qa-feedbcak.usecase";
import { UpdateNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/update-nlq-qa-feedback.usecase";
import { DeleteNlqQaFeedbackUseCase } from "@/core/application/usecases/nlq/nlq-qa-feedback/delete-nlq-qa-feedback.usecase";
import { NlqQaFeedbackRepository } from "@/infrastructure/repository/nlq/nlq-qa-feedback.repo";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { NlqQaAppRepository } from "@/infrastructure/repository/nlq/nlq-qa.repo";

// Integration test for ToggleNlqQaFeedbackOrchestrator

describe("ToggleNlqQaFeedbackOrchestrator (integration)", () => {
  const logger = new WinstonLoggerProvider();
  const firebaseAdmin = new FirebaseAdminProvider();
  const feedbackRepository = new NlqQaFeedbackRepository(logger, firebaseAdmin);
  const nlqQaRepository = new NlqQaAppRepository(logger, firebaseAdmin);

  const createFbUseCase = new CreateNlqQaFeedbackUseCase(
    logger,
    feedbackRepository,
    nlqQaRepository
  );
  const updateFbUseCase = new UpdateNlqQaFeedbackUseCase(
    logger,
    feedbackRepository,
    nlqQaRepository
  );
  const deleteFbUseCase = new DeleteNlqQaFeedbackUseCase(
    logger,
    feedbackRepository,
    nlqQaRepository
  );

  const orchestrator = new ToggleNlqQaFeedbackOrchestrator(
    logger,
    createFbUseCase,
    updateFbUseCase,
    deleteFbUseCase
  );

  const createdFeedbackIds: string[] = [];

  afterEach(async () => {
    // Clean up created feedback
    for (const id of createdFeedbackIds) {
      await deleteFbUseCase.execute(id);
    }
    createdFeedbackIds.length = 0;
  });

  it("should create feedback when feedbackId is not provided", async () => {
    const createDto = NlqQaFeedbackBuilder.makeCreateDto();

    const result = await orchestrator.execute({
      nlqQaId: createDto.nlqQaId,
      isGood: createDto.isGood,
      comment: createDto.comment,
      userId: createDto.createdBy,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    createdFeedbackIds.push(result.data!.id);
  });

  it("should update feedback when feedbackId is provided", async () => {
    const createDto = NlqQaFeedbackBuilder.makeCreateDto();
    const createResult = await orchestrator.execute({
      nlqQaId: createDto.nlqQaId,
      isGood: createDto.isGood,
      comment: createDto.comment,
      userId: createDto.createdBy,
    });
    createdFeedbackIds.push(createResult.data!.id);

    const updateDto = NlqQaFeedbackBuilder.makeUpdateDto({
      id: createResult.data!.id,
    });

    const updateResult = await orchestrator.execute({
      feedbackId: updateDto.id,
      nlqQaId: updateDto.nlqQaId,
      isGood: updateDto.isGood,
      comment: updateDto.comment,
      userId: updateDto.updatedBy,
    });

    expect(updateResult.success).toBe(true);
    expect(updateResult.data).toBeDefined();
    expect(updateResult.data!.isGood).toBe(updateDto.isGood);
    expect(updateResult.data!.comment).toBe(updateDto.comment);
  });

  it("should delete feedback when feedbackId is provided and isGood is null", async () => {
    const createDto = NlqQaFeedbackBuilder.makeCreateDto();
    const createResult = await orchestrator.execute({
      nlqQaId: createDto.nlqQaId,
      isGood: createDto.isGood,
      comment: createDto.comment,
      userId: createDto.createdBy,
    });
    createdFeedbackIds.push(createResult.data!.id);

    const deleteResult = await orchestrator.execute({
      feedbackId: createResult.data!.id,
      nlqQaId: createDto.nlqQaId,
      isGood: null,
      comment: null,
      userId: createDto.createdBy,
    });

    expect(deleteResult.success).toBe(true);
    expect(deleteResult.data).toBeNull();
  });
});
