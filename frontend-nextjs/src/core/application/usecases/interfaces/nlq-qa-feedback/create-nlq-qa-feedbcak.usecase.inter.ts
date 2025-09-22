import {
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface ICreateNlqQaFeedbackUseCase {
  execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}
