import {
  TNlqQaFeedbackInOrqDto,
  TNlqQaFeedbackOutRequestDto,
} from "../dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "../dtos/utils/response.app.dto";
import { ILogger } from "../interfaces/ilog.app.inter";
import { IDeleteNlqQaGoodStep } from "../steps/nlq-qa-good/delete-nlq-qa-good.step";
import { ICreateNlqQaFeedbackUseCase } from "../usecases/nlq/nlq-qa-feedback/create-nlq-qa-feedbcak.usecase";
import { IDeleteNlqQaFeedbackUseCase } from "../usecases/nlq/nlq-qa-feedback/delete-nlq-qa-feedback.usecase";
import { IUpdateNlqQaFeedbackUseCase } from "../usecases/nlq/nlq-qa-feedback/update-nlq-qa-feedback.usecase";
import { ICreateNlqQaGoodUseCase } from "../usecases/nlq/nlq-qa-good/create-nlq-qa-good.usecase";
import { IDeleteQaGoodUseCase } from "../usecases/nlq/nlq-qa-good/delete-qa-good.usecase";
import { IReadNlqQaGoodByIdUseCase } from "../usecases/nlq/nlq-qa-good/read-nlq-qa-good-by-id.usecase";
import { ISoftDeleteNlqQaGoodUseCase } from "../usecases/nlq/nlq-qa-good/soft-delete-nlq-qa-good.usecase";
import { IUpdateNlqQaGoodUseCase } from "../usecases/nlq/nlq-qa-good/update-nlq-qa-good.usecase";
import { IReadNlqQaByIdUseCase } from "../usecases/nlq/nlq-qa/read-nlq-qa-by-id.usecase";

export interface IToggleNlqQaFeedbackOrchestrator {
  execute(
    data: TNlqQaFeedbackInOrqDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}

export class ToggleNlqQaFeedbackOrchestrator
  implements IToggleNlqQaFeedbackOrchestrator
{
  constructor(
    private readonly logger: ILogger,
    private readonly createFbUseCase: ICreateNlqQaFeedbackUseCase,
    private readonly updateFbUseCase: IUpdateNlqQaFeedbackUseCase,
    private readonly deleteFbUseCase: IDeleteNlqQaFeedbackUseCase,
    private readonly readNlqQaByIdUseCase: IReadNlqQaByIdUseCase,
    private readonly readNlqQaGoodByIdUseCase: IReadNlqQaGoodByIdUseCase,
    private readonly createNlqQaGoodUseCase: ICreateNlqQaGoodUseCase,
    private readonly deleteNlqQaGoodUseCase: IDeleteQaGoodUseCase
  ) {}

  async execute(
    data: TNlqQaFeedbackInOrqDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>> {
    try {
      this.logger.info(
        "[ToggleNlqQaFeedbackOrchestrator] Executing with data:",
        data
      );
      //   Validate input
      if (data.nlqQaId.trim() === "") {
        throw new Error("nlqQaId is required");
      }
      // ======================= MANAGE NLQ QA GOOD ===========================
      // Get the nlq qa query
      const nlqQaResult = await this.readNlqQaByIdUseCase.execute(
        data?.nlqQaId
      );
      const nlqQaData = nlqQaResult?.data || null;

      // Get the nlq qa good if exists
      const nlqQaGoodResult = await this.readNlqQaGoodByIdUseCase.execute(
        nlqQaData?.nlqQaGoodId || ""
      );
      const nlqQaGoodData = nlqQaGoodResult?.data || null;
      if (!nlqQaGoodData && data.isGood === true) {
        // If the nlqQaGood does not exist and the feedback is good, create it
        const res = await this.createNlqQaGoodUseCase.execute({
          question: nlqQaData.question,
          query: nlqQaData.query,
          originId: data.nlqQaId,
          actorId: data.userId,
          questionBy: nlqQaData.createdBy,
          dbConnectionId: nlqQaData.dbConnectionId,
        });
      }
      if (nlqQaGoodData && data.isGood === false) {
        // If the nlqQaGood exists and the feedback is bad, delete it
        await this.deleteNlqQaGoodUseCase.execute(nlqQaGoodData.id);
      }
      if (nlqQaGoodData && data.isGood === null) {
        await this.deleteNlqQaGoodUseCase.execute(nlqQaGoodData.id);
      }

      // ======================= MANAGE NLQ QA GOOD ===========================

      //  1. If feedbackId is provided update or delete the feedback
      if (data.feedbackId) {
        //   1.1 If isGood is null, delete the feedback
        if (data.isGood === null) {
          return await this.deleteFbUseCase.execute(data.feedbackId);
        }
        //   1.2 If isGood is not null, update the feedback
        if (data.isGood !== null) {
          return await this.updateFbUseCase.execute(data.feedbackId, {
            id: data.feedbackId,
            nlqQaId: data.nlqQaId,
            isGood: data.isGood,
            comment: data.comment,
            updatedBy: data.userId,
          });
        }
      }

      // 2. If feedbackId is not provided, create new feedback
      if (!data.feedbackId && data.isGood !== null) {
        return await this.createFbUseCase.execute({
          createdBy: data.userId,
          nlqQaId: data.nlqQaId,
          isGood: data.isGood,
          comment: data.comment,
        });
      }

      //   3. If feedbackId is not provided and isGood is null, throw error
      throw new Error(
        "None of the conditions to create, update or delete feedback were met"
      );
    } catch (error) {
      this.logger.error("[ToggleNlqQaFeedbackOrchestrator] Error:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
        rawError: error,
      });
      return {
        success: false,
        message: `Error toggling NLQ QA Feedback: ${error instanceof Error ? error.message : "unknown"}`,
        data: null,
      };
    }
  }
}
