import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";
import { IReadNlqQaFeedbackByIdUseCase } from "../../interfaces/nlq-qa-feedback/read-nlq-qa-feedback-by-id.usecase.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";

export class ReadNlqQaFeedbackByIdUseCase
  implements IReadNlqQaFeedbackByIdUseCase
{
  constructor(
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository,
    private readonly logger: ILogger
  ) {}
  async execute(
    id: string
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>> {
    try {
      const nlqQaFeedback = await this.nlqQaFeedbackRepository.findById(id);
      if (!nlqQaFeedback) {
        this.logger.error(
          `[ReadNlqQaFeedbackByIdUseCase] Nlq Qa Feedback not found: ${id}`
        );
        return {
          success: false,
          message: "Nlq Qa Feedback not found",
          data: null,
        };
      }
      return {
        success: true,
        message: "Nlq Qa Feedback retrieved successfully",
        data: nlqQaFeedback,
      };
    } catch (error) {
      this.logger.error(`[ReadNlqQaFeedbackByIdUseCase] Error: ${error}`);
      return {
        data: null,
        message: "Error reading Nlq Qa Feedback",
        success: false,
      };
    }
  }
}
