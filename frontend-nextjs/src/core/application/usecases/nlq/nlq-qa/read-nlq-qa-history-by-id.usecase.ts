import { TNlqQaHistoryOutDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadNlqQaByIdStep } from "@/core/application/steps/nlq-qa/read-nlq-qa-by-id.step";

export interface IReadNlqQaHistoryByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaHistoryOutDto>>;
}

export class ReadNlqQaHistoryByIdUseCase
  implements IReadNlqQaHistoryByIdUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaHistoryByIdStep: IReadNlqQaByIdStep
  ) {}
  async execute(id: string): Promise<TResponseDto<TNlqQaHistoryOutDto>> {
    try {
      this.logger.info("[ReadNlqQaHistoryByIdUseCase] Executing with ID:", id);
      if (!id) {
        this.logger.error("[ReadNlqQaHistoryByIdUseCase] Invalid ID:", id);
        return {
          success: false,
          message: "Invalid ID",
          data: null,
        };
      }

      const result = await this.readNlqQaHistoryByIdStep.run(id);
      return {
        success: true,
        message: "NLQ QA history retrieved successfully",
        data: result,
      };
    } catch (error) {
      this.logger.error("Error reading NLQ QA history by id", error.message);
      return {
        success: false,
        message: error.message || "Error reading NLQ QA history",
        data: null,
      };
    }
  }
}
