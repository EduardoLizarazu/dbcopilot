import { INlqQaInformationExecuteQueryUseCase } from "../../interfaces/nlq-qa-information/nlq-qa-information-execute-query.usecase.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaInformationRepository } from "@/core/application/interfaces/nlq/nlq-qa-information.app.inter";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TNlqInformationData } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";

export class NlqQaInformationExecuteQueryUseCase
  implements INlqQaInformationExecuteQueryUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaInformationRepository: INlqQaInformationRepository
  ) {}
  async execute(
    query: string,
    dateParams?: { start: Date; end: Date }
  ): Promise<TResponseDto<TNlqInformationData>> {
    try {
      this.logger.info(
        `[NlqQaInformationExecuteQueryUseCase] Executing query: ${query} with dateParams: ${JSON.stringify(dateParams)}`
      );
      const result = await this.nlqQaInformationRepository.executeQuery(
        query,
        dateParams
      );
      this.logger.info(
        `[NlqQaInformationExecuteQueryUseCase] Query executed successfully: ${JSON.stringify(result)}`
      );
      return {
        success: true,
        message: "NLQ query executed successfully",
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `[NlqQaInformationExecuteQueryUseCase] Error: ${error}`
      );
      return {
        success: false,
        message: "Error executing NLQ query",
        data: null,
      };
    }
  }
}
