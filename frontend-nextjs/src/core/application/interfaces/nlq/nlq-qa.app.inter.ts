import {
  TCreateNlqQaDto,
  TNlqQaHistoryOutDto,
  TNlqQaOutRequestDto,
  TNlqQaWitFeedbackOutRequestDto,
  TUpdateNlqQaDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaRepository
  extends IGenericMutationRepository<
    TCreateNlqQaDto,
    TUpdateNlqQaDto,
    TNlqQaOutRequestDto
  > {
  findByIdWithUserAndFeedback(
    id: string
  ): Promise<TNlqQaWitFeedbackOutRequestDto>;
  findAllWithUserAndFeedback(): Promise<TNlqQaWitFeedbackOutRequestDto[]>;
  findAllByUserId(userId: string): Promise<TNlqQaHistoryOutDto[]>;
  findByQuestionQueryHash(
    queryQueryHash: string
  ): Promise<TNlqQaOutRequestDto | null>;
  findByQueryHash(queryHash: string): Promise<TNlqQaOutRequestDto | null>;
  softDeleteById(id: string): Promise<void>;
}
