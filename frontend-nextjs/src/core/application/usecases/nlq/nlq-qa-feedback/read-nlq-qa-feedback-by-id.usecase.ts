import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaFeedbackRepository } from "../../../interfaces/nlq/nlq-qa-feedback.app.inter";

export interface IReadNlqQaFeedbackByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}

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
      this.logger.error(
        `[ReadNlqQaFeedbackByIdUseCase] Error retrieving Nlq Qa Feedback: ${error}`
      );
      return {
        success: false,
        message: "Error retrieving Nlq Qa Feedback",
        data: null,
      };
    }
  }
}
