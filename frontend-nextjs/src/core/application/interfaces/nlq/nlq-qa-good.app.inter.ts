import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodOutRequestDto,
  TNlqQaGoodOutWithUserAndConnRequestDto,
  TUpdateNlqQaGoodDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaGoodRepository
  extends IGenericMutationRepository<
    TCreateNlqQaGoodDto,
    TUpdateNlqQaGoodDto,
    TNlqQaGoodOutRequestDto
  > {
  findByDbConnId(dbConnId: string): Promise<TNlqQaGoodOutRequestDto[]>;
  findAllWithUserAndConn(): Promise<TNlqQaGoodOutWithUserAndConnRequestDto[]>;
  findWithUserAndConnById(
    id: string
  ): Promise<TNlqQaGoodOutWithUserAndConnRequestDto | null>;
  findByUserId(uid: string): Promise<TNlqQaGoodOutRequestDto[]>;
  switchSoftDelete(id: string): Promise<void>;
}
