import {
  TCreateNlqQaKnowledgeDto,
  TNlqQaKnowledgeOutRequestDto,
  TUpdateNlqQaKnowledgeDto,
  TUpdateSplitterNameOnKnowledgeBaseDto,
} from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaKnowledgePort
  extends IGenericMutationRepository<
    TCreateNlqQaKnowledgeDto,
    TUpdateNlqQaKnowledgeDto,
    TNlqQaKnowledgeOutRequestDto
  > {
  findByQuestion({
    namespace,
    question,
  }: {
    namespace: string;
    question: string;
  }): Promise<TNlqQaKnowledgeOutRequestDto[]>;
  deleteAllBySplitter(splitterName: string): Promise<void>;
  deleteSplitter(id: string, splitter_name: string): Promise<void>;
  updateSplitterName(
    data: TUpdateSplitterNameOnKnowledgeBaseDto
  ): Promise<void>;
}
