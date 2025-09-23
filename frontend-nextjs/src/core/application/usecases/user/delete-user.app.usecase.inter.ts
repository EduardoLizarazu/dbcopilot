import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IDeleteUserAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
