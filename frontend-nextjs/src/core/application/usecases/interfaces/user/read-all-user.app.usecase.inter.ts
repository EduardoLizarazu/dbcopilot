import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IReadAllUserAppUseCase {
  execute(): Promise<TResponseDto>;
}
