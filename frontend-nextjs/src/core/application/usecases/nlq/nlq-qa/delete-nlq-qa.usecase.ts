import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IDeleteNlqQaAppUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}

export class DeleteNlqQaAppUseCase implements IDeleteNlqQaAppUseCase {
  constructor(
    private readonly nlqQaRepository: INlqQaRepository,
    private readonly logger: ILogger
  ) {}
  async execute(id: string): Promise<TResponseDto<null>> {
    try {
      await this.nlqQaRepository.delete(id);
      return {
        success: true,
        message: "NLQ QA entry deleted successfully",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `Error in DeleteNlqQaAppUseCase: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
