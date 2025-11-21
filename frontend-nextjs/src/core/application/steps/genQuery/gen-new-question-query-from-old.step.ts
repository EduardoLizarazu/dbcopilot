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
          vData.error
        );
        throw new Error("Validation failed");
      }

      // validate
      if (!data.previousQuestion || !data.previousQuery) {
        throw new Error(
          "Validation failed: previousQuestion and previousQuery are required."
        );
      }

      if (!data.schemaChange || !data.schemaChange.status) {
        throw new Error("Validation failed: schemaChange is required.");
      }

      if (
        data.schemaChange.status !== ESchemaChangeStatus.UPDATE &&
        data.schemaChange.status !== ESchemaChangeStatus.DELETE
      ) {
        throw new Error(
          "Validation failed: schemaChange.status must be UPDATE or DELETE."
        );
      }

      // UPDATE requires old + new + schemaCtx
      if (data.schemaChange.status === "UPDATE") {
        if (!data.schemaChange.old || !data.schemaChange.new) {
          throw new Error(
            "Validation failed: UPDATE requires schemaChange.old and schemaChange.new."
          );
        }

        if (!data.schemaCtx || data.schemaCtx.length === 0) {
          throw new Error(
            "Validation failed: UPDATE requires a non-empty schemaCtx."
          );
        }
      }

      // DELETE requires only new (old optional but irrelevant)
      if (data.schemaChange.status === ESchemaChangeStatus.DELETE) {
        if (!data.schemaChange.new) {
          throw new Error(
            "Validation failed: DELETE requires schemaChange.new."
          );
        }
      }

      const response =
        await this.nlqQaQueryGenerationPort.genNewQuestionAndQuery({
          previousQuestion: data.previousQuestion,
          previousQuery: data.previousQuery,
          schemaChange: data.schemaChange,
          schemaCtx: data.schemaCtx,
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
