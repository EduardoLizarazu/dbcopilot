import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

export interface IDeleteSplitterOnKnowledgeBaseStep {
  run(data: { splitterName: string }): Promise<void>;
}

export class DeleteSplitterOnKnowledgeBaseStep
  implements IDeleteSplitterOnKnowledgeBaseStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}

  async run(data: { splitterName: string }): Promise<void> {
    try {
      this.logger.info(
        `[DeleteSplitterOnKnowledgeBaseStep] Deleting knowledge base entries for splitter: ${data.splitterName}`
      );
      //   1. Validate input
      if (!data.splitterName) {
        this.logger.error(`[DeleteSplitterOnKnowledgeBaseStep] Invalid input`);
        throw new Error(`Invalid input`);
      }
      await this.knowledgePort.deleteAllBySplitter(data.splitterName);
    } catch (error) {
      this.logger.error(
        `[DeleteSplitterOnKnowledgeBaseStep] Error deleting knowledge base entries for splitter: ${data.splitterName}`,
        error.message
      );
      throw new Error(
        error.message || "Error deleting knowledge base entries for splitter"
      );
    }
  }
}
