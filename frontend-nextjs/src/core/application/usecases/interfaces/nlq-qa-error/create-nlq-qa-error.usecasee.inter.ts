import { TCreateNlqQaErrorDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface ICreateNlqQaErrorUseCase {
  execute(
    data: TCreateNlqQaErrorDto,
    requester: TRequesterDto
  ): Promise<TResponseDto>;
}
