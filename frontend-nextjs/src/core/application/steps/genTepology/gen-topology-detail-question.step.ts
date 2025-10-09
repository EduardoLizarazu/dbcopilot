import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "../../ports/nlq-qa-topology-generation.port";

export interface IGenTopologyDetailQuestionStep {
  run(data: {
    question: string;
    query: string;
  }): Promise<{ detailQuestion: string }>;
}

export class GenTopologyDetailQuestionStep
  implements IGenTopologyDetailQuestionStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly genTopoPort: INlqQaTopologyGenerationPort
  ) {}
  async run(data: {
    question: string;
    query: string;
  }): Promise<{ detailQuestion: string }> {
    try {
      this.logger.info(
        `[GenTopologyDetailQuestionStep] Running detail question generation from topology`,
        data
      );

      // 1. Validate input
      if (!data.question || data.question.trim() === "") {
        this.logger.error(
          `[GenTopologyDetailQuestionStep] Invalid input question: ${data?.question}`
        );
        throw new Error("Invalid input question");
      }

      if (!data.query || data.query.trim() === "") {
        this.logger.error(
          `[GenTopologyDetailQuestionStep] Invalid input query: ${data?.query}`
        );
        throw new Error("Invalid input query");
      }

      // 2. Generate detail question using the generation port
      const response = await this.genTopoPort.genDetailQuestion({
        question: data.question,
        query: data.query,
      });

      if (!response?.detailQuestion) {
        this.logger.error(
          `[GenTopologyDetailQuestionStep] No detail question generated from topology`
        );
        throw new Error("No detail question generated from topology");
      }

      return { detailQuestion: response.detailQuestion };
    } catch (error) {
      this.logger.error(
        `[GenTopologyDetailQuestionStep] Error: ${error.message}`
      );
      throw new Error(
        "Error generating detail question from topology: " + error.message
      );
    }
  }
}
