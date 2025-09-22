import { TNlqInformationData } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface INlqQaQueryGenerationUseCase {
  execute(question: string): Promise<TResponseDto<{ answer: string }>>;
}
