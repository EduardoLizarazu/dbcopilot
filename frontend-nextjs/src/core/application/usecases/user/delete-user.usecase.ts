import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IDeleteUserUseCase {
  execute(id: string): Promise<TResponseDto<null>>;
}
