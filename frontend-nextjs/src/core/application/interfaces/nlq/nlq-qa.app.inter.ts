import {
  TCreateNlqQaDto,
  TNlqQaOutRequestDto,
  TUpdateNlqQaDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaRepository
  extends IGenericMutationRepository<
    TCreateNlqQaDto,
    TUpdateNlqQaDto,
    TNlqQaOutRequestDto
  > {
  findByQuestion(question: string): Promise<TNlqQaOutRequestDto[]>;
}
