import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TCreateRoleDto } from "@/core/application/dtos/auth/role.app.dto";

export interface ICreateRoleAppUseCase {
  execute(
    data: TCreateRoleDto,
    requester: TRequesterDto
  ): Promise<TResponseDto>;
}
