import { TUpdateNlqQaFeedbackDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IUpdateNlqQaFeedbackUseCase {
  execute(
    id: string,
    data: TUpdateNlqQaFeedbackDto,
    requester: TRequesterDto
  ): Promise<TResponseDto>;
}
