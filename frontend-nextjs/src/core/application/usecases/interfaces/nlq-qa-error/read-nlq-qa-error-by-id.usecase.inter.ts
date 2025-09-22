import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadNlqQaErrorByIdUseCase {
  execute(id: string): Promise<TResponseDto>;
}
