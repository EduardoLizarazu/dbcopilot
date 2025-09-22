import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadNlqQaFeedbackByIdUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}
