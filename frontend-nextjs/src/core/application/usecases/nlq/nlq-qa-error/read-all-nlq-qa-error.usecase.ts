import { TNlqQaErrorOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";

export interface IReadAllNlqQaErrorUseCase {
  execute(): Promise<TResponseDto<TNlqQaErrorOutRequestDto[]>>;
}

export class ReadAllNlqQaErrorUseCase implements IReadAllNlqQaErrorUseCase {
  constructor(
    private readonly nlqQaErrorRepository: INlqQaErrorRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<TResponseDto<TNlqQaErrorOutRequestDto[]>> {
    try {
      this.logger.info(
        `[ReadAllNlqQaErrorUseCase] - Executing read all NLQ QA Errors`
      );
      const nlqQaErrors = await this.nlqQaErrorRepository.findAll();
      return {
        message: "NLQ QA Errors retrieved successfully",
        data: nlqQaErrors,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `[ReadAllNlqQaErrorUseCase] - Error executing read all NLQ QA Errors - ${error}`
      );
      return {
        message: "Internal server error",
        data: null,
        success: false,
      };
    }
  }
}
