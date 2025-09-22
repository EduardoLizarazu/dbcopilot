import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface INlqQaExtractSuggestionFromPromptAppUseCase {
  execute(prompt: string): Promise<TResponseDto<{ suggestion: string }>>;
}
