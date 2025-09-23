import {
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
  TUpdateNlqQaFeedbackDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaFeedbackRepository
  extends IGenericMutationRepository<
    TCreateNlqQaFeedbackDto,
    TUpdateNlqQaFeedbackDto,
    TNlqQaFeedbackOutRequestDto
  > {
  findByIsItGood(isGood: boolean): Promise<TNlqQaFeedbackOutRequestDto[]>;
}
