import {
  createNlqQaKnowledgeSchema,
  TCreateNlqQaKnowledgeDto,
} from "../../dtos/nlq/nlq-qa-knowledge.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaKnowledgePort } from "../../ports/nlq-qa-knowledge.app.inter";

export interface IAddToTheKnowledgeBaseStep {
  run(data: TCreateNlqQaKnowledgeDto): Promise<{ id: string }>;
}

export class AddToTheKnowledgeBaseStep implements IAddToTheKnowledgeBaseStep {
  constructor(
    private readonly logger: ILogger,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}

  async run(data: TCreateNlqQaKnowledgeDto): Promise<{ id: string }> {
    try {
      this.logger.info(
        `[AddToTheKnowledgeBaseStep] Adding to knowledge base: ${data}`
      );

      // 1. Validate input
      const validInput = await createNlqQaKnowledgeSchema.safeParseAsync(data);
      if (!validInput.success) {
        this.logger.error(`[AddToTheKnowledgeBaseStep] Invalid input: ${data}`);
        throw new Error("Invalid input");
      }

      // 2. Add to knowledge base using the knowledge port
      const knowledgeId = await this.knowledgePort.create(data);
      this.logger.info(
        `[AddToTheKnowledgeBaseStep] Added to knowledge base with ID: ${knowledgeId}`
      );
      return { id: knowledgeId };
    } catch (error) {
      this.logger.error(
        `[AddToTheKnowledgeBaseStep] Error adding to knowledge base: ${error.message}`
      );
      throw new Error("Error adding to knowledge base: " + error.message);
    }
  }
}
