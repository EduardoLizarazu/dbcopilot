import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadNlqQaGoodByIdUseCase {
  execute(id: string): Promise<TResponseDto>;
}
