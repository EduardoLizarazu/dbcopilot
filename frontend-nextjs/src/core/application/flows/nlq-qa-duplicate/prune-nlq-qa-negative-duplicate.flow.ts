/**
 * Use case interface for pruning negative feedback entries:
 * 1. Fetch the nlqQaId entry.
 * 2. Identify if nlqQa.isGood=false entries exist.
 * 3. Check by question+query hash if multiple negative feedbacks exist.
 * 4. If duplicates found, retain only the most recent entry, delete others.
 * 5. Check if query hash exists in negative feedbacks.
 * 6. If duplicates found, retain only the most recent entry, delete others.
 * 7. Check if any feedback is found on the (negative) knowledge base.
 * 8. If found and <condition>, retain only the most recent entry, delete others, else retain all.
 * 9. Return decision.
 *
 * Note: Ones it's corrected, it must be remove from (negative) knowledge base as well.
 * Note: Remember to implement the hash on the creation of negative feedbacks.
 * Note: Remember to include the IGNORE LOGIC
 * Note: I will have to update the knowledge base delete step to handle multiple deletions by filter.
 */

import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadNlqQaByQuestionQueryHashStep } from "../../steps/nlq-qa/read-nlq-qa-by-question-query-hash.step";
import { IReadNlqQaByQueryHashStep } from "../../steps/nlq-qa/read-nlq-qa-by-query-hash.step";

export interface IPruneNegativeFbFlow {
  flow(data: {
    currQuestion: string;
    currQuery: string;
    currNamespace: string;
    currQuestionQueryHash: string;
    currQueryHash: string;
  }): Promise<{ isIgnored: boolean }>;
}

export class PruneNegativeFbFlow implements IPruneNegativeFbFlow {
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaByQuestionQueryHash: IReadNlqQaByQuestionQueryHashStep,
    private readonly readNlqQaByQueryHashStep: IReadNlqQaByQueryHashStep
  ) {}
  async flow(data: {
    currQuestion: string;
    currQuery: string;
    currNamespace: string;
    currQuestionQueryHash: string;
    currQueryHash: string;
  }): Promise<{ isIgnored: boolean }> {
    try {
      this.logger.info(
        "[IPruneNegativeFbUseCase] Method not implemented.",
        data
      );

      if (
        !data?.currQuestion ||
        !data?.currQuery ||
        !data?.currNamespace ||
        !data?.currQuestionQueryHash ||
        !data?.currQueryHash
      ) {
        this.logger.error(
          "[IPruneNegativeFbUseCase] Invalid input data.",
          data
        );
        throw new Error("Invalid input data");
      }

      const nlqQaByQuestionQueryHash =
        await this.readNlqQaByQuestionQueryHash.run(data.currQuestionQueryHash);

      const nlqQaByQueryHash = await this.readNlqQaByQueryHashStep.run(
        data.currQueryHash
      );

      if (nlqQaByQuestionQueryHash || nlqQaByQueryHash) {
        return { isIgnored: true };
      }
    } catch (error) {
      this.logger.error(
        "[IPruneNegativeFbUseCase] Method not implemented.",
        error.message
      );
      throw new Error(error.message || "Method not implemented.");
    }
  }
}
