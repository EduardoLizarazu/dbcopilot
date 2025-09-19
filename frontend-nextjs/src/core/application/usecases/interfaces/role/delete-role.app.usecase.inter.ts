import { TRequesterDto } from "@/core/application/dtos/requester.app.dto";
import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IDeleteRoleAppUseCase {
  execute(id: string, requester: TRequesterDto): Promise<TResponseDto>;
}
