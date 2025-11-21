import {
  ESchemaChangeStatus,
  TGenNewQuestionQueryFromOldDto,
} from "../../dtos/gen-query.dto";
import { TSchemaCtxSchemaDto } from "../../dtos/schemaCtx.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IGenNewQuestionAndQueryFromOldStep } from "../../steps/genQuery/gen-new-question-query-from-old.step";

export interface IGenNewQuestionAndQueryFromOldUseCase {
  execute(
    data: TGenNewQuestionQueryFromOldDto
  ): Promise<TResponseDto<{ question: string; query: string }>>;
}

export class GenNewQuestionAndQueryFromOldUseCase
  implements IGenNewQuestionAndQueryFromOldUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly genNewQuestionAndQueryStep: IGenNewQuestionAndQueryFromOldStep
  ) {}

  async execute(
    data: TGenNewQuestionQueryFromOldDto
  ): Promise<TResponseDto<{ question: string; query: string }>> {
    try {
      this.logger.info(
        `[GenNewQuestionAndQueryUseCase] Executing use case with data:`,
        data
      );
      const result = await this.genNewQuestionAndQueryStep.run({
        previousQuestion: data.previousQuestion,
        previousQuery: data.previousQuery,
        schemaCtxDiff: data.schemaCtxDiff,
      });
      this.logger.info(
        `[GenNewQuestionAndQueryUseCase] Use case executed successfully with result:`,
        result
      );
      return {
        message: "New question and query generated successfully",
        data: result,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `[GenNewQuestionAndQueryUseCase] Error executing use case:`,
        error.message
      );
      throw new Error(
        error.message || "Error generating new question and query"
      );
    }
  }
}
