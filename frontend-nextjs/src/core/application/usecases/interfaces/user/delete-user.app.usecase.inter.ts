import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IDeleteUserAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
