import { TRequesterDto } from "@/core/application/dtos/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { TCreateRoleDto } from "@/core/application/dtos/role.app.dto";

export interface ICreateRoleAppUseCase {
  execute(
    data: TCreateRoleDto,
    requester: TRequesterDto
  ): Promise<TResponseDto>;
}
