import {
  TCreateNlqQaKnowledgeDto,
  TNlqQaKnowledgeOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface ICreateNlqQaKnowledgeUseCase {
  execute(
    data: TCreateNlqQaKnowledgeDto
  ): Promise<TResponseDto<TNlqQaKnowledgeOutRequestDto>>;
}
