import { TRequesterDto } from "@/core/application/dtos/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { TUpdateRoleDto } from "@/core/application/dtos/role.app.dto";

export interface IUpdateRoleAppUseCase {
  execute(
    id: string,
    data: TUpdateRoleDto,
    requester: TRequesterDto
  ): Promise<TResponseDto>;
}
