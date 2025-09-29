import {
  TCreateNlqQaDto,
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
  softDeleteById(id: string): Promise<void>;
}
