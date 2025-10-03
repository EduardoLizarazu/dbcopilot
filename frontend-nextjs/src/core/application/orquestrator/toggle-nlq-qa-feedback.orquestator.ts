import {
  TNlqQaFeedbackInOrqDto,
  TNlqQaFeedbackOutRequestDto,
} from "../dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "../dtos/utils/response.app.dto";
import { ILogger } from "../interfaces/ilog.app.inter";
import { ICreateNlqQaFeedbackUseCase } from "../usecases/nlq/nlq-qa-feedback/create-nlq-qa-feedbcak.usecase";
import { IDeleteNlqQaFeedbackUseCase } from "../usecases/nlq/nlq-qa-feedback/delete-nlq-qa-feedback.usecase";
import { IUpdateNlqQaFeedbackUseCase } from "../usecases/nlq/nlq-qa-feedback/update-nlq-qa-feedback.usecase";

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
    private readonly deleteFbUseCase: IDeleteNlqQaFeedbackUseCase
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
