import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodOutRequestDto,
  TNlqQaGoodOutWithUserRequestDto,
  TUpdateNlqQaGoodDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaGoodRepository
  extends IGenericMutationRepository<
    TCreateNlqQaGoodDto,
    TUpdateNlqQaGoodDto,
    TNlqQaGoodOutRequestDto
  > {
  findAllWithUser(): Promise<TNlqQaGoodOutWithUserRequestDto[]>;
  findWithUserById(id: string): Promise<TNlqQaGoodOutWithUserRequestDto | null>;
  findByUserId(uid: string): Promise<TNlqQaGoodOutRequestDto[]>;
  switchSoftDelete(id: string): Promise<void>;
}
