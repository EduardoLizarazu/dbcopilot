import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

export interface IDeleteOnKnowledgeBaseByIdStep {
  run(data: { id: string; splitterName: string }): Promise<void>;
}

export class DeleteOnKnowledgeBaseByIdStep
  implements IDeleteOnKnowledgeBaseByIdStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}

  async run(data: { id: string; splitterName: string }): Promise<void> {
    try {
      this.logger.info(`Deleting knowledge base entry with id: ${data.id}`, {
        splitterName: data.splitterName,
      });

      //   1. Validate input
      if (!data.id && !data.splitterName) {
        this.logger.error(`Invalid input`);
        throw new Error(`Invalid input`);
      }

      await this.knowledgePort.deleteSplitter(data.id, data.splitterName);
    } catch (error) {
      this.logger.error(
        `Error deleting knowledge base entry with id: ${data.id}`,
        error.message
      );
      throw new Error(`Error deleting knowledge base entry: ${error.message}`);
    }
  }
}
