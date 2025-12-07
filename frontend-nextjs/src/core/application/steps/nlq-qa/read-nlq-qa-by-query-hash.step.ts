import { TNlqQaOutRequestDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface IReadNlqQaByQueryHashStep {
  run(queryHash: string): Promise<TNlqQaOutRequestDto | null>;
}

export class ReadNlqQaByQueryHashStep implements IReadNlqQaByQueryHashStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}

  async run(queryHash: string): Promise<TNlqQaOutRequestDto | null> {
    try {
      this.logger.info(
        `[IReadNlqQaByQueryHashStep]: Executing with queryHash: ${queryHash}`
      );
      if (!queryHash) {
        throw new Error("questionQueryHash is required");
      }

      const nlqQa = await this.nlqQaRepo.findByQueryHash(queryHash);
      return nlqQa;
    } catch (error) {
      this.logger.error(
        `[IReadNlqQaByQueryHashStep]: `,
        error.message || "Unknown error"
      );
      throw new Error(error.message || "Unknown error");
    }
  }
}
