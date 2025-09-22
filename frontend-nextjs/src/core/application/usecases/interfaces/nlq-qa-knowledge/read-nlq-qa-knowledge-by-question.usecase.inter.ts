import { TNlqQaKnowledgeOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadNlqQaKnowledgeByQuestionUseCase {
  execute(
    question: string
  ): Promise<TResponseDto<TNlqQaKnowledgeOutRequestDto[]>>;
}
