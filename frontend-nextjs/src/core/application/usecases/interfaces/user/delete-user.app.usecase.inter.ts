import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IDeleteUserAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
