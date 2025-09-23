import { TCreateNlqQaErrorDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";

export interface ICreateNlqQaErrorUseCase {
  execute(data: TCreateNlqQaErrorDto): Promise<TResponseDto<string>>;
}
export class CreateNlqQaErrorUseCase implements ICreateNlqQaErrorUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaErrorRepository: INlqQaErrorRepository
  ) {}
  async execute(data: TCreateNlqQaErrorDto): Promise<TResponseDto<string>> {
    try {
      this.logger.info("[CreateNlqQaErrorUseCase] Executing use case", data);
      const id = await this.nlqQaErrorRepository.create(data);

      this.logger.info(
        `[CreateNlqQaErrorUseCase] Use case executed successfully with ID: ${id}`
      );
      return {
        data: id,
        message: "NLQ QA Error created successfully",
        success: true,
      };
    } catch (error) {
      this.logger.error(
        "[CreateNlqQaErrorUseCase] Error executing use case",
        error
      );
      return {
        data: null,
        message: "Error creating NLQ QA Error",
        success: false,
      };
    }
  }
}
