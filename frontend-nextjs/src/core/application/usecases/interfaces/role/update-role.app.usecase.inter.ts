import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IUpdateRoleAppUseCase {
  execute(id: string, data: TUpdateRoleDto): Promise<TResponseDto>;
}
