import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IReadAllUserAppUseCase {
  execute(): Promise<TResponseDto>;
}
