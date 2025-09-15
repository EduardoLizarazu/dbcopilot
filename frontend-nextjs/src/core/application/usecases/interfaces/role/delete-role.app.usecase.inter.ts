import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IDeleteRoleAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
