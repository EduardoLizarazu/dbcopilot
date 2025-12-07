import { TNlqQaOutRequestDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

export interface IReadNlqQaGoodByQuestionQueryHashStep {
  run(questionQueryHash: string): Promise<TNlqQaOutRequestDto | null>;
}

export class ReadNlqQaGoodByQuestionQueryHashStep
  implements IReadNlqQaGoodByQuestionQueryHashStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}

  async run(questionQueryHash: string): Promise<TNlqQaOutRequestDto | null> {
    try {
      this.logger.info(
        `[IReadNlqQaGoodByQuestionQueryHashStep]: Executing with questionQueryHash: ${questionQueryHash}`
      );
      if (!questionQueryHash) {
        throw new Error("questionQueryHash is required");
      }

      const nlqQa = await this.nlqQaGoodRepo.findByQuestionQueryHash(
        questionQueryHash
      );
      return nlqQa;
    } catch (error) {
      this.logger.error(
        `[IReadNlqQaGoodByQuestionQueryHashStep]: `,
        error.message || "Unknown error"
      );
      throw new Error(error.message || "Unknown error");
    }
  }
}
