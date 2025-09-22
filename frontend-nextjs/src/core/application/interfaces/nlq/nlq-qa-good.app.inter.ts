import {
  TCreateNlqQaGoodDto,
  TUpdateNlqQaGoodDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaGoodRepository
  extends IGenericMutationRepository<
    TCreateNlqQaGoodDto,
    TUpdateNlqQaGoodDto,
    TCreateNlqQaGoodDto
  > {
  findByUserId(uid: string): Promise<TCreateNlqQaGoodDto[]>;
}
