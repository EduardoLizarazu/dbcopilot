import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IReadByEmailUserAppUseCase {
  execute(email: string): Promise<TResponseDto>;
}
