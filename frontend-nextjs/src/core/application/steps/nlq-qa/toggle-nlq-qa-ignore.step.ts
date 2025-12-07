import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface IToggleNlqQaIgnoreStep {
  run(data: { nlqQaId: string; isIgnore: boolean }): Promise<void>;
}

export class ToggleNlqQaIgnoreStep implements IToggleNlqQaIgnoreStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}

  async run(data: { nlqQaId: string; isIgnore: boolean }): Promise<void> {
    try {
      await this.nlqQaRepo.update(data.nlqQaId, {
        isIgnore: data.isIgnore,
      });

      this.logger.info(
        `[ToggleNlqQaIgnoreStep] Toggled isIgnore to ${data.isIgnore} for NLQ QA ID: ${data.nlqQaId}`
      );
      return;
    } catch (error) {
      this.logger.error(
        `[ToggleNlqQaIgnoreStep] Error toggling isIgnore for NLQ QA ID: ${data.nlqQaId} - ${error.message}`
      );
      throw new Error(error.message || "Error toggling isIgnore status");
    }
  }
}
