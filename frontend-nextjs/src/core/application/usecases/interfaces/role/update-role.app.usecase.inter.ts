import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IUpdateRoleAppUseCase {
  execute(id: string, data: TUpdateRoleDto): Promise<TResponseDto>;
}
