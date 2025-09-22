import { TRequesterDto } from "@/core/application/dtos/utils/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IDeleteRoleAppUseCase {
  execute(id: string, requester: TRequesterDto): Promise<TResponseDto>;
}
