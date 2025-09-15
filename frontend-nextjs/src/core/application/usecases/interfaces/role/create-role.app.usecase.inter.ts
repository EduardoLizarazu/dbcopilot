import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { TCreateRoleDto } from "@/core/application/dtos/role.domain.dto";

export interface ICreateRoleAppUseCase {
  execute(data: TCreateRoleDto): Promise<TResponseDto>;
}
