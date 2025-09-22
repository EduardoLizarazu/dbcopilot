import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadByEmailUserAppUseCase {
  execute(email: string): Promise<TResponseDto>;
}
