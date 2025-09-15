import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { TCreateRoleDto } from "@/core/application/dtos/role.app.dto";

export interface ICreateRoleAppUseCase {
  execute(data: TCreateRoleDto): Promise<TResponseDto>;
}
