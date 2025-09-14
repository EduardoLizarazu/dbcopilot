import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IDeleteRoleAppUseCase {
  execute(id: string): Promise<TResponseDto>;
}
