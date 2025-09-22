import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadByIdRoleAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
