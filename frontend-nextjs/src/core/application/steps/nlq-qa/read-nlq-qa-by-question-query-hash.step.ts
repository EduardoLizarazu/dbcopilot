import { TNlqQaOutRequestDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface IReadNlqQaByQuestionQueryHashStep {
  run(questionQueryHash: string): Promise<TNlqQaOutRequestDto | null>;
}

export class ReadNlqQaByQuestionQueryHashStep
  implements IReadNlqQaByQuestionQueryHashStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}

  async run(questionQueryHash: string): Promise<TNlqQaOutRequestDto | null> {
    try {
      this.logger.info(
        `[IReadNlqQaByQuestionQueryHashStep]: Executing with questionQueryHash: ${questionQueryHash}`
      );
      if (!questionQueryHash) {
        throw new Error("questionQueryHash is required");
      }

      const nlqQa = await this.nlqQaRepo.findByQuestionQueryHash(
        questionQueryHash
      );
      return nlqQa;
    } catch (error) {
      this.logger.error(
        `[IReadNlqQaByQuestionQueryHashStep]: `,
        error.message || "Unknown error"
      );
      throw new Error(error.message || "Unknown error");
    }
  }
}
