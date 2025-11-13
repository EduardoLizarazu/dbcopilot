import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";

export interface IReadAllNlqQaFeedbackUseCase {
  execute(): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto[]>>;
}

export class ReadAllNlqQaFeedbackUseCase
  implements IReadAllNlqQaFeedbackUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository
  ) {}

  async execute(): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto[]>> {
    try {
      const feedbacks = await this.nlqQaFeedbackRepository.findAll();
      return {
        success: true,
        message: "Nlq Qa Feedbacks retrieved successfully",
        data: feedbacks,
      };
    } catch (error) {
      this.logger.error(
        `[ReadAllNlqQaFeedbackUseCase] Error retrieving Nlq Qa Feedbacks: ${error}`
      );
      return {
        success: false,
        message: "Error retrieving Nlq Qa Feedbacks",
        data: [],
      };
    }
  }
}
