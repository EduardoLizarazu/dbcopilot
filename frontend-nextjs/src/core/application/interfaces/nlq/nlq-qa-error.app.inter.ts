import {
  TCreateNlqQaErrorDto,
  TNlqQaErrorOutRequestDto,
  TUpdateNlqQaErrorDto,
} from "../../dtos/nlq/nlq-qa-error.app.dto";
import { IGenericMutationRepository } from "../generic.app.inter";

export interface INlqQaErrorRepository
  extends IGenericMutationRepository<
    TCreateNlqQaErrorDto,
    TUpdateNlqQaErrorDto,
    TNlqQaErrorOutRequestDto
  > {
  findByUserId(uid: string): Promise<TNlqQaErrorOutRequestDto[]>;
}
