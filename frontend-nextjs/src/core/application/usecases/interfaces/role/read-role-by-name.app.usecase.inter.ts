import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IReadByNameAppUseCase {
  execute(name: string): Promise<TResponseDto>;
}
