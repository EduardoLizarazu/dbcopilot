import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaGoodRepository
  extends IGenericMutationRepository<
    TCreateNlqQaGoodDto,
    TUpdateNlqQaGoodDto,
    TNlqQaGoodOutRequestDto
  > {
  findByUserId(uid: string): Promise<TCreateNlqQaGoodDto[]>;
}
