import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TUpdateRoleDto } from "@/core/application/dtos/auth/role.app.dto";

export interface IUpdateRoleAppUseCase {
  execute(
    id: string,
    data: TUpdateRoleDto,
    requester: TRequesterDto
  ): Promise<TResponseDto>;
}
