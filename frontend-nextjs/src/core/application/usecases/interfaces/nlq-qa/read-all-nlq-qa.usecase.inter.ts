import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadAllNlqQaAppUseCase {
  execute(): Promise<TResponseDto<TNlqQaOutRequestDto[]>>;
}
