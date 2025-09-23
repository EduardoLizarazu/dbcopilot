import {
  TCreateNlqQaKnowledgeDto,
  TNlqQaKnowledgeOutRequestDto,
  TUpdateNlqQaKnowledgeDto,
} from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaKnowledgePort
  extends IGenericMutationRepository<
    TCreateNlqQaKnowledgeDto,
    TUpdateNlqQaKnowledgeDto,
    TNlqQaKnowledgeOutRequestDto
  > {
  findByQuestion(question: string): Promise<TNlqQaKnowledgeOutRequestDto[]>;
  findByQuery(query: string): Promise<TNlqQaKnowledgeOutRequestDto[]>;
}
