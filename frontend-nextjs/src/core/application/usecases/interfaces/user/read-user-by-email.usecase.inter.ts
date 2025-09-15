import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IReadByEmailUserAppUseCase {
  execute(email: string): Promise<TResponseDto>;
}
