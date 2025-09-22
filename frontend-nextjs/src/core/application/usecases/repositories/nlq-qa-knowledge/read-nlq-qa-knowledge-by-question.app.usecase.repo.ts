import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { IReadNlqQaKnowledgeByQuestionUseCase } from "../../interfaces/nlq-qa-knowledge/read-nlq-qa-knowledge-by-question.usecase.inter";
import { INlqQaKnowledgeRepository } from "@/core/application/interfaces/nlq/nlq-qa-knowledge.app.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { TNlqQaKnowledgeOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";

export class ReadNlqQaKnowledgeByQuestionUseCase
  implements IReadNlqQaKnowledgeByQuestionUseCase
{
  constructor(
    private readonly nlqQaKnowledgeRepository: INlqQaKnowledgeRepository,
    private readonly logger: ILogger
  ) {}
  async execute(
    question: string
  ): Promise<TResponseDto<TNlqQaKnowledgeOutRequestDto[]>> {
    try {
      const result =
        await this.nlqQaKnowledgeRepository.findByQuestion(question);
      if (!result) {
        this.logger.warn(
          `[ReadNlqQaKnowledgeByQuestionUseCase] No result found for question: ${question}`
        );
        return {
          success: false,
          message: "No result found",
          data: null,
        };
      }
      return {
        success: true,
        message: "Result found",
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `[ReadNlqQaKnowledgeByQuestionUseCase] Error: ${error}`
      );
      return {
        success: false,
        message: "Error retrieving NLQ QA knowledge",
        data: null,
      };
    }
  }
}
