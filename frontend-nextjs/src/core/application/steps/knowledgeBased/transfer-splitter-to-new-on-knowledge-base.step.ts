import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

export interface ITransferSplitterToNewOnKnowledgeBaseStep {
  run(data: {
    id: string;
    oldSplitterName: string;
    newSplitterName: string;
  }): Promise<void>;
}

export class TransferSplitterToNewOnKnowledgeBaseStep
  implements ITransferSplitterToNewOnKnowledgeBaseStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}
  async run(data: {
    id: string;
    oldSplitterName: string;
    newSplitterName: string;
  }): Promise<void> {
    try {
      this.logger.info(
        `[TransferSplitterToNewOnKnowledgeBaseStep] Transferring splitter to new on knowledge base: ${JSON.stringify(
          data
        )}`
      );

      //   1. Validate input data
      if (!data.id || !data.oldSplitterName || !data.newSplitterName) {
        this.logger.error(
          `[TransferSplitterToNewOnKnowledgeBaseStep] Invalid input data: ${JSON.stringify(
            data
          )}`
        );
        throw new Error("Invalid input data");
      }

      //   2. Call knowledge port to delete old splitter entries
      await this.knowledgePort.transferSplitterKnowledge(data);
    } catch (error) {
      this.logger.error(
        `[TransferSplitterToNewOnKnowledgeBaseStep] Error transferring splitter to new on knowledge base: ${error.message}`
      );
      throw new Error(
        error.message || "Error transferring splitter to new on knowledge base"
      );
    }
  }
}
