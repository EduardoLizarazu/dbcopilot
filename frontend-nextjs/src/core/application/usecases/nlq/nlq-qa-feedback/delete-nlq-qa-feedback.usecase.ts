import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IDeleteNlqQaFeedbackUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteNlqQaFeedbackUseCase implements IDeleteNlqQaFeedbackUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}

  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      // 1. Validate
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

      // 2. Check if feedback exists
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
      // 3. Delete feedback
      await this.nlqQaFeedbackRepository.delete(id);
      this.logger.info(
        `[DeleteNlqQaFeedbackUseCase] Deleted NLQ QA feedback with ID: ${id}`
      );

      // 4. Update related NLQ QA with feedbackId = ""
      // 4.1 Find all NLQ QAs
      const nlqQa = await this.nlqQaRepo.findById(feedback.nlqQaId);
      if (!nlqQa) {
        this.logger.warn(
          `[DeleteNlqQaFeedbackUseCase] Related NLQ QA not found with ID: ${feedback.nlqQaId}`
        );
        return {
          message: "NLQ QA feedback deleted, but related NLQ QA not found",
          success: true,
          data: null,
        };
      }

      // 4.2 If found, update feedbackId to ""

      await this.nlqQaRepo.update(nlqQa.id, { feedbackId: "" });

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
