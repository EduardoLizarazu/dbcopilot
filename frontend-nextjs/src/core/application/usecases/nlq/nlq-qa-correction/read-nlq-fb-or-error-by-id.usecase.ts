import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export type TNlqQaFbOrErrorByIdOutRequestDto = {
  nlqFeedback: TNlqQaWitFeedbackOutRequestDto;
  nlqError: unknown;
};

export interface IReadNlqQaFbOrErrorByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaFbOrErrorByIdOutRequestDto>>;
}

export class ReadNlqQaFbOrErrorByIdUseCase
  implements IReadNlqQaFbOrErrorByIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository,
    private readonly errorRepo: INlqQaErrorRepository
  ) {}
  async execute(
    id: string
  ): Promise<TResponseDto<TNlqQaFbOrErrorByIdOutRequestDto>> {
    try {
      // 1. Verify params
      if (!id) {
        return {
          success: false,
          data: null,
          message: "ID parameter is required",
        };
      }

      // 2. Find NLQ QA with user and feedback.
      const nlqFeedback = await this.nlqQaRepo.findByIdWithUserAndFeedback(id);

      // 3. Find NLQ QA Error by NLQ QA Id
      const nlqError = await this.errorRepo.findByNlqQaId(id);
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
