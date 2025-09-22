import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadAllUserAppUseCase {
  execute(): Promise<TResponseDto>;
}
