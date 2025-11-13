import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

export interface IRemoveNlqQaRefOnNlqQaGoodStep {
  run(data: { nlqId: string }): Promise<void>;
}

export class RemoveNlqQaRefOnNlqQaGoodStep
  implements IRemoveNlqQaRefOnNlqQaGoodStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}
  async run(data: { nlqId: string }): Promise<void> {
    try {
      this.logger.info(
        `[RemoveNlqQaRefOnNlqQaGoodStep] Removing NLQ QA reference on NLQ QA Good for NLQ ID: `,
        JSON.stringify(data)
      );
      //   1. Validate input
      if (!data?.nlqId) {
        throw new Error("NLQ ID is required to remove NLQ QA reference.");
      }
      //   2. Find all references in nlq_qa_good table
      const nlqQaGoodEntries = await this.nlqQaGoodRepo.findAllByNlqQaId(
        data.nlqId
      );

      if (nlqQaGoodEntries.length === 0) {
        this.logger.info(
          `[RemoveNlqQaRefOnNlqQaGoodStep] No NLQ QA Good entries found for NLQ ID: ${data.nlqId}`
        );
        return;
      }

      //   3. Update each entry to remove the reference to nlqId
      for (const entry of nlqQaGoodEntries) {
        await this.nlqQaGoodRepo.update(entry.id, {
          originId: "",
        });
      }

      //   4. Log the successful removal of NLQ QA reference
      this.logger.info(
        `[RemoveNlqQaRefOnNlqQaGoodStep] Successfully removed NLQ QA reference on NLQ QA Good for NLQ ID: ${data.nlqId}`
      );
    } catch (error) {
      this.logger.error(
        `[RemoveNlqQaRefOnNlqQaGoodStep] Error removing NLQ QA reference on NLQ QA Good for NLQ ID: ${data.nlqId}`,
        error.message
      );
      throw new Error(
        error.message ||
          `Failed to remove NLQ QA reference on NLQ QA Good for NLQ ID: ${data.nlqId}`
      );
    }
  }
}
