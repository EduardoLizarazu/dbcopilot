import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadNlqQaByIdAppUseCase {
  execute(id: string): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}
