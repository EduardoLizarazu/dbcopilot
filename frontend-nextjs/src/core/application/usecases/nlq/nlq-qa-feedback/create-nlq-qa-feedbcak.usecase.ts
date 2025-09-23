import {
  createNlqQaFeedbackSchema,
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { INlqQaFeedbackRepository } from "../../../interfaces/nlq/nlq-qa-feedback.app.inter";
import { ILogger } from "../../../interfaces/ilog.app.inter";

export interface ICreateNlqQaFeedbackUseCase {
  execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}

export class CreateNlqQaFeedbackUseCase implements ICreateNlqQaFeedbackUseCase {
  constructor(
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository,
    private readonly logger: ILogger
  ) {}
  async execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>> {
    try {
      // Validate data
      const validateNlqQaFeedback =
        await createNlqQaFeedbackSchema.safeParseAsync(data);
      if (!validateNlqQaFeedback.success) {
        this.logger.error(
          `[CreateNlqQaFeedbackUseCase] Invalid data: ${JSON.stringify(
            validateNlqQaFeedback.error.issues
          )}`
        );
      }
      // Create Nlq Qa Feedback
      const nlqQaFeedbackId = await this.nlqQaFeedbackRepository.create({
        ...data,
      });

      //   Find Nlq Qa Feedback
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
