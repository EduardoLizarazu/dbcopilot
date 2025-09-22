import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface INlqQaExtractQueryFromPromptAppUseCase {
  execute(prompt: string): Promise<TResponseDto<string>>;
}
