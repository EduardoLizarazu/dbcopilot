import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IDeleteNlqQaAppUseCase {
  execute(id: string): Promise<TResponseDto<void>>;
}
