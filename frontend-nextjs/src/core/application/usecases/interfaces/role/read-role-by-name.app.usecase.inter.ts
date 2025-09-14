import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IReadByNameAppUseCase {
  execute(name: string): Promise<TResponseDto>;
}
