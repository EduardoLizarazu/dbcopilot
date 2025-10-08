import { TNlqQaKnowledgeOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";

export interface ISearchSimilarQuestionOnKnowledgeBaseStep {
  run(data: {
    question: string;
    splitterName: string;
  }): Promise<TNlqQaKnowledgeOutRequestDto[]>;
}

export class SearchSimilarQuestionOnKnowledgeBaseStep
  implements ISearchSimilarQuestionOnKnowledgeBaseStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly knowledgePort: INlqQaKnowledgePort
  ) {}
  async run(data: {
    question: string;
    splitterName: string;
  }): Promise<TNlqQaKnowledgeOutRequestDto[]> {
    try {
      this.logger.info(
        `[SearchSimilarQuestionOnKnowledgeBaseStep] Searching for similar questions in knowledge base...`
      );

      if (!data.question || !data.splitterName) {
        this.logger.warn(
          `[SearchSimilarQuestionOnKnowledgeBaseStep] Question or splitterName is missing. Skipping search.`,
          { question: data.question, splitterName: data.splitterName }
        );
        throw new Error("Question and splitterName are required");
      }

      const results = await this.knowledgePort.findByQuestion({
        question: data.question,
        namespace: data.splitterName,
      });
      this.logger.info(
        `[SearchSimilarQuestionOnKnowledgeBaseStep] Found ${results.length} similar questions.`
      );
      return results;
    } catch (error) {
      this.logger.error(
        `[SearchSimilarQuestionOnKnowledgeBaseStep] Error occurred while searching for similar questions: ${error.message}`
      );
      throw new Error(
        "Error searching for similar questions: " + error.message
      );
    }
  }
}
