import {
  TCreateNlqQaGoodDetailsDto,
  TUpdateNlqQaGoodDetailsDto,
  TNlqQaGoodDetailsOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good-detail.app.dto";
import { IGenericMutationRepository } from "@/core/application/interfaces/generic.app.inter";

export interface INlqQaGoodDetailsRepository
  extends IGenericMutationRepository<
    TCreateNlqQaGoodDetailsDto,
    TUpdateNlqQaGoodDetailsDto,
    TNlqQaGoodDetailsOutRequestDto
  > {
  findByTableName(tableName: string): Promise<TNlqQaGoodDetailsOutRequestDto[]>;
  findByColumnName(
    columnName: string
  ): Promise<TNlqQaGoodDetailsOutRequestDto[]>;
}
