import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IReadByIdRoleAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
