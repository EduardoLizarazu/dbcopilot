import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";

export interface IDeleteNlqQaFeedbackUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteNlqQaFeedbackUseCase implements IDeleteNlqQaFeedbackUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      if (!id) {
        this.logger.error(
          `[DeleteNlqQaFeedbackUseCase] Invalid ID provided: ${id}`
        );
        return {
          message: "Invalid ID provided",
          success: false,
          data: null,
        };
      }

      const feedback = await this.nlqQaFeedbackRepository.findById(id);
      if (!feedback) {
        this.logger.error(
          `[DeleteNlqQaFeedbackUseCase] Feedback not found with ID: ${id}`
        );
        return {
          message: "Feedback not found",
          success: false,
          data: null,
        };
      }

      await this.nlqQaFeedbackRepository.delete(id);
      this.logger.info(
        `[DeleteNlqQaFeedbackUseCase] Deleted NLQ QA feedback with ID: ${id}`
      );
      return {
        message: "NLQ QA feedback deleted successfully",
        success: true,
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `[DeleteNlqQaFeedbackUseCase] Error deleting NLQ QA feedback with ID ${id}: ${error.message}`
      );
      return {
        message: error.message || "Error deleting NLQ QA feedback",
        success: false,
        data: null,
      };
    }
  }
}
