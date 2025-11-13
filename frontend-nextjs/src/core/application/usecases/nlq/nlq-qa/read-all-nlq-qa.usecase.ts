import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IReadAllNlqQaUseCase {
  execute(): Promise<TResponseDto<TNlqQaOutRequestDto[]>>;
}

export class ReadAllNlqQaUseCase implements IReadAllNlqQaUseCase {
  constructor(
    private logger: ILogger,
    private nlqQaRepository: INlqQaRepository
  ) {}

  async execute(): Promise<TResponseDto<TNlqQaOutRequestDto[]>> {
    try {
      this.logger.info("Reading all NLQ QA entries");
      const nlqQaEntries = await this.nlqQaRepository.findAll();
      this.logger.info(`Found ${nlqQaEntries.length} NLQ QA entries`);
      return {
        success: true,
        message: "NLQ QA entries retrieved successfully",
        data: nlqQaEntries,
      };
    } catch (error) {
      this.logger.error("Error reading all NLQ QA entries", { error });
      return {
        success: false,
        message: "Error retrieving NLQ QA entries",
        data: [],
      };
    }
  }
}
