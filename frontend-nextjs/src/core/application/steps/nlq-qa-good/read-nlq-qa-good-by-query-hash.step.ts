import { TNlqQaOutRequestDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

export interface IReadNlqQaGoodByQueryHashStep {
  run(queryHash: string): Promise<TNlqQaOutRequestDto | null>;
}

export class ReadNlqQaGoodByQueryHashStep
  implements IReadNlqQaGoodByQueryHashStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}

  async run(queryHash: string): Promise<TNlqQaOutRequestDto | null> {
    try {
      this.logger.info(
        `[IReadNlqQaGoodByQueryHashStep]: Executing with queryHash: ${queryHash}`
      );
      if (!queryHash) {
        throw new Error("questionQueryHash is required");
      }

      const nlqQa = await this.nlqQaGoodRepo.findByQueryHash(queryHash);
      return nlqQa;
    } catch (error) {
      this.logger.error(
        `[IReadNlqQaGoodByQueryHashStep]: `,
        error.message || "Unknown error"
      );
      throw new Error(error.message || "Unknown error");
    }
  }
}
