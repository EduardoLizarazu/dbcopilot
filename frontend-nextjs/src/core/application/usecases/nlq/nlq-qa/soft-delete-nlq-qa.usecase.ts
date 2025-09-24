import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IDeleteNlqQaUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class SoftDeleteNlqQaUseCase implements IDeleteNlqQaUseCase {
  constructor(
    private readonly nlqQaRepository: INlqQaRepository,
    private readonly logger: ILogger
  ) {}
  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      // 1. Validate input
      if (!id) {
        this.logger.error(`[SoftDeleteNlqQaAppUseCase] Invalid id: ${id}`);
        return {
          success: false,
          message: "Invalid id",
          data: null,
        };
      }
      await this.nlqQaRepository.softDeleteById(id);
      return {
        success: true,
        message: "NLQ QA entry soft deleted successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `Error in SoftDeleteNlqQaAppUseCase: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
