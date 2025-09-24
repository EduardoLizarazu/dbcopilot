import {
  TNlqQaFeedbackOutRequestDto,
  TUpdateNlqQaFeedbackDto,
  updateNlqQaFeedbackSchema,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { INlqQaFeedbackRepository } from "../../../interfaces/nlq/nlq-qa-feedback.app.inter";
import { ILogger } from "../../../interfaces/ilog.app.inter";

export interface IUpdateNlqQaFeedbackUseCase {
  execute(
    id: string,
    data: TUpdateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}

export class UpdateNlqQaFeedbackUseCase implements IUpdateNlqQaFeedbackUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository
  ) {}

  async execute(
    id: string,
    data: TUpdateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>> {
    try {
      // 1. Validate input
      if (!id) {
        this.logger.error(`[UpdateNlqQaFeedbackUseCase] Invalid id: ${id}`);
        return {
          success: false,
          message: "Invalid id",
          data: null,
        };
      }
      const validateData = await updateNlqQaFeedbackSchema.safeParseAsync(data);
      if (!validateData.success) {
        this.logger.error(
          `[UpdateNlqQaFeedbackUseCase] Invalid data: ${JSON.stringify(
            validateData.error.issues
          )}`
        );
        return {
          success: false,
          message: "Invalid data",
          data: null,
        };
      }

      // 2. Find if Nlq Qa Feedback exists
      const existingNlqQaFeedback =
        await this.nlqQaFeedbackRepository.findById(id);
      if (!existingNlqQaFeedback) {
        this.logger.error(
          `[UpdateNlqQaFeedbackUseCase] Nlq Qa Feedback not found: ${id}`
        );
        return {
          success: false,
          message: "Nlq Qa Feedback not found",
          data: null,
        };
      }

      // 3. Update Nlq Qa Feedback
      await this.nlqQaFeedbackRepository.update(id, data);

      // 4. Find Nlq Qa Feedback
      const nlqQaFeedback = await this.nlqQaFeedbackRepository.findById(id);
      if (!nlqQaFeedback) {
        this.logger.error(
          `[UpdateNlqQaFeedbackUseCase] Nlq Qa Feedback not found after update: ${id}`
        );
        return {
          success: false,
          message: "Nlq Qa Feedback not found after update",
          data: null,
        };
      }

      // 5. Return success response
      return {
        success: true,
        message: "Nlq Qa Feedback updated successfully",
        data: nlqQaFeedback,
      };
    } catch (error) {
      this.logger.error(
        `[UpdateNlqQaFeedbackUseCase] Error updating Nlq Qa Feedback: ${error}`
      );
      return {
        success: false,
        message: "Error updating Nlq Qa Feedback",
        data: null,
      };
    }
  }
}
