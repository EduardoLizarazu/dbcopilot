import { TSchemaCtxSchemaDto } from "../../dtos/schemaCtx.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "../../ports/nlq-qa-query-generation.port";

export interface IGenNewQuestionAndQueryStep {
  run(data: {
    previousQuestion: string;
    previousQuery: string;
    schemaChange: {
      status: "DELETE" | "UPDATE";
      new: string; // delete schema in string format
      old: string;
    };
    schemaCtx: TSchemaCtxSchemaDto[]; // only if has change (update)
  }): Promise<{ question: string; query: string }>;
}

export class GenNewQuestionAndQueryStep implements IGenNewQuestionAndQueryStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaQueryGenerationPort: INlqQaQueryGenerationPort
  ) {}
  async run(data: {
    previousQuestion: string;
    previousQuery: string;
    schemaChange: {
      status: "DELETE" | "UPDATE";
      new: string; // delete schema in string format
      old: string;
    };
    schemaCtx: TSchemaCtxSchemaDto[]; // only if has change (update)
  }): Promise<{ question: string; query: string }> {
    try {
      this.logger.info(
        `[GenNewQuestionAndQueryStep] Running new question and query generation`,
        data
      );
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
        data.schemaChange.status !== "UPDATE" &&
        data.schemaChange.status !== "DELETE"
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
      if (data.schemaChange.status === "DELETE") {
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
