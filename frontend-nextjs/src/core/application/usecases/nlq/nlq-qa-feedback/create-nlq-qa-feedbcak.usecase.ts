import {
  createNlqQaFeedbackSchema,
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { INlqQaFeedbackRepository } from "../../../interfaces/nlq/nlq-qa-feedback.app.inter";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface ICreateNlqQaFeedbackUseCase {
  execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}

export class CreateNlqQaFeedbackUseCase implements ICreateNlqQaFeedbackUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository,
    private readonly nlqQaRepository: INlqQaRepository
  ) {}
  async execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>> {
    try {
      // 1. Validate data
      const validateNlqQaFeedback =
        await createNlqQaFeedbackSchema.safeParseAsync(data);
      if (!validateNlqQaFeedback.success) {
        this.logger.error(
          `[CreateNlqQaFeedbackUseCase] Invalid data: ${JSON.stringify(
            validateNlqQaFeedback.error.issues
          )}`
        );
        return {
          success: false,
          message: "Invalid data",
          data: null,
        };
      }

      // 2. Check if NLQ QA exists
      const nlqQa = await this.nlqQaRepository.findById(data.nlqQaId);
      if (!nlqQa) {
        this.logger.error(
          `[CreateNlqQaFeedbackUseCase] NLQ QA not found for ID: ${data.nlqQaId}`
        );
        return {
          success: false,
          message: "NLQ QA not found",
          data: null,
        };
      }

      // 3. Create Nlq Qa Feedback
      const nlqQaFeedbackId = await this.nlqQaFeedbackRepository.create({
        ...data,
      });

      // 4. Find Nlq Qa Feedback
      const nlqQaFeedback =
        await this.nlqQaFeedbackRepository.findById(nlqQaFeedbackId);
      if (!nlqQaFeedback) {
        this.logger.error(
          `[CreateNlqQaFeedbackUseCase] Nlq Qa Feedback not found after creation: ${nlqQaFeedbackId}`
        );
        return {
          success: false,
          message: "Nlq Qa Feedback not found after creation",
          data: null,
        };
      }

      // 5. Update NLQ QA with feedback ID and status
      await this.nlqQaRepository.update(data.nlqQaId, {
        ...nlqQa,
        feedbackId: nlqQaFeedbackId,
        isGood: data.isGood,
        updatedAt: new Date(),
        updatedBy: data.createdBy,
      });

      // 6. Return success response
      return {
        success: true,
        message: "Nlq Qa Feedback created successfully",
        data: nlqQaFeedback,
      };
    } catch (error) {
      this.logger.error(
        `[CreateNlqQaFeedbackUseCase] Error creating NLQ QA feedback: ${error}`
      );
      return {
        success: false,
        message: "Error creating NLQ QA feedback",
        data: null,
      };
    }
  }
}
