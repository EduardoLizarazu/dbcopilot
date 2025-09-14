import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IReadByIdRoleAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
