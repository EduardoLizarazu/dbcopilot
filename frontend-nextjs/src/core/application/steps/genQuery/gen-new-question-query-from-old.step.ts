import {
  ESchemaChangeStatus,
  genNewQuestionQueryFromOld,
  TGenNewQuestionQueryFromOldDto,
} from "../../dtos/gen-query.dto";
import { TSchemaCtxSchemaDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "../../ports/nlq-qa-query-generation.port";

export interface IGenNewQuestionAndQueryFromOldStep {
  run(
    data: TGenNewQuestionQueryFromOldDto
  ): Promise<{ question: string; query: string }>;
}

export class GenNewQuestionAndQueryFromOldStep
  implements IGenNewQuestionAndQueryFromOldStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaQueryGenerationPort: INlqQaQueryGenerationPort
  ) {}
  async run(
    data: TGenNewQuestionQueryFromOldDto
  ): Promise<{ question: string; query: string }> {
    try {
      this.logger.info(
        `[GenNewQuestionAndQueryStep] Running new question and query generation`,
        data
      );
      const vData = await genNewQuestionQueryFromOld.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[GenNewQuestionAndQueryStep] Validation failed: `,
          vData.error.issues.map((e) => e.message).join(", ")
        );
        throw new Error("Validation failed");
      }
      const response =
        await this.nlqQaQueryGenerationPort.genNewQuestionAndQuery({
          previousQuestion: data.previousQuestion,
          previousQuery: data.previousQuery,
          schemaCtxDiff: data.schemaCtxDiff,
        });

      return { question: response.question, query: response.query };
    } catch (error) {
      this.logger.error(`[GenNewQuestionAndQueryStep] Error: `, error.message);
      throw new Error(
        error.message || "Error generating new question and query"
      );
    }
  }
}
