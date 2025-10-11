import {
  TUpdateSplitterNameOnKnowledgeBaseDto,
  updateSplitterNameOnKnowledgeBaseDto,
} from "../../dtos/nlq/nlq-qa-knowledge.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

/**
 * Step for updating splitter name in knowledge base:
 * 1. Validate input data
 * 2. Call knowledge port to update splitter name
 */

export interface IUpdateSplitterNameOnKnowledgeBaseStep {
  run(data: TUpdateSplitterNameOnKnowledgeBaseDto): Promise<void>;
}

export class UpdateSplitterNameOnKnowledgeBaseStep
  implements IUpdateSplitterNameOnKnowledgeBaseStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}

  async run(data: TUpdateSplitterNameOnKnowledgeBaseDto): Promise<void> {
    try {
      this.logger.info(
        `[UpdateSplitterNameOnKnowledgeBaseStep] Updating splitter name in knowledge base: ${JSON.stringify(
          data
        )}`
      );

      // 1. Validate input data
      const validData =
        await updateSplitterNameOnKnowledgeBaseDto.safeParseAsync(data);
      if (!validData.success) {
        this.logger.error(
          `[UpdateSplitterNameOnKnowledgeBaseStep] Invalid input data: ${JSON.stringify(validData.error)}`
        );
        throw new Error("Invalid input data: " + validData.error.message);
      }

      // 2. Call knowledge port to update splitter name
      await this.knowledgePort.updateSplitterName(validData.data);

      this.logger.info(
        `[UpdateSplitterNameOnKnowledgeBaseStep] Successfully updated splitter name in knowledge base: ${JSON.stringify(
          validData.data
        )}`
      );
    } catch (error) {
      this.logger.error(
        `[UpdateSplitterNameOnKnowledgeBaseStep] Error updating splitter name in knowledge base: ${error}`
      );
      throw new Error(
        "Error updating splitter name in knowledge base: " +
          (error as Error).message
      );
    }
  }
}
