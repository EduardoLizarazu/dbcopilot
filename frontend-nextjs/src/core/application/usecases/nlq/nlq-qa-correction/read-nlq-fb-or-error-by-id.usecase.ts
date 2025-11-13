import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IReadNlqQaFbOrErrorByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaWitFeedbackOutRequestDto>>;
}

export class ReadNlqQaFbOrErrorByIdUseCase
  implements IReadNlqQaFbOrErrorByIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}
  async execute(
    id: string
  ): Promise<TResponseDto<TNlqQaWitFeedbackOutRequestDto>> {
    try {
      // 1. Verify params
      if (!id) {
        this.logger.warn(
          "[ReadNlqQaFbOrErrorByIdUseCase] ID parameter is required",
          { id }
        );
        return {
          success: false,
          data: null,
          message: "ID parameter is required",
        };
      }

      // 2. Find NLQ QA with user and feedback.
      const nlq = await this.nlqQaRepo.findByIdWithUserAndFeedback(id);

      if (!nlq) {
        this.logger.warn("[ReadNlqQaFbOrErrorByIdUseCase] NLQ QA not found", {
          id,
        });
        return {
          success: false,
          data: null,
          message: "NLQ QA not found",
        };
      }

      this.logger.info(
        "[ReadNlqQaFbOrErrorByIdUseCase] Successfully fetched NLQ QA feedback",
        { id: nlq.id }
      );

      // 3. Verify if isGood is false
      if (nlq.isGood !== false) {
        this.logger.warn(
          "[ReadNlqQaFbOrErrorByIdUseCase] NLQ QA is not marked as bad for correction",
          { id: nlq.id, isGood: nlq.isGood }
        );
        return {
          success: false,
          data: null,
          message: "NLQ QA is not marked as bad for correction",
        };
      }

      // 4. Return the NLQ QA with feedback and user.
      return {
        success: true,
        data: nlq,
        message: "Successfully fetched NLQ QA feedback",
      };
    } catch (error) {
      this.logger.error(
        "[ReadNlqQaFbOrErrorByIdUseCase] Error fetching NLQ QA feedback",
        {
          error,
        }
      );
      return {
        success: false,
        data: null,
        message: `Error fetching NLQ QA feedback: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}
