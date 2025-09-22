import {
  TNlqQaOutRequestDto,
  TUpdateNlqQaDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IUpdateNlqQaAppUseCase {
  execute(
    id: string,
    data: TUpdateNlqQaDto,
    requester: TRequesterDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}
