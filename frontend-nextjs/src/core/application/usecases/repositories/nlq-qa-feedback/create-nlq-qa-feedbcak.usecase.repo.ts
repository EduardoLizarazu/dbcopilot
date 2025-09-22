import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";
import { ICreateNlqQaFeedbackUseCase } from "../../interfaces/nlq-qa-feedback/create-nlq-qa-feedbcak.usecase.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadNlqQaByIdAppUseCase } from "../../interfaces/nlq-qa/read-nlq-qa-by-id.usecase.inter";
import {
  createNlqQaFeedbackSchema,
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { IReadNlqQaFeedbackByIdUseCase } from "../../interfaces/nlq-qa-feedback/read-nlq-qa-feedback-by-id.usecase.inter";

export class CreateNlqQaFeedbackUseCase implements ICreateNlqQaFeedbackUseCase {
  constructor(
    private readonly nlqQaFeedbackRepository: INlqQaFeedbackRepository,
    private readonly logger: ILogger,
    private readonly readNlqQaFeedbackByIdUseCase: IReadNlqQaFeedbackByIdUseCase
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
        await this.readNlqQaFeedbackByIdUseCase.execute(nlqQaFeedbackId);
      if (!nlqQaFeedback || !nlqQaFeedback.data) {
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
        data: nlqQaFeedback.data,
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
