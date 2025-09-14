import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface ICreateRoleAppUseCase {
  execute(data: TCreateRoleDto): Promise<TResponseDto>;
}
