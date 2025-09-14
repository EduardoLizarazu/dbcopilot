import { TResponseDto } from "@/core/application/dtos/response.domain.dto";

export interface IReadAllRoleAppUseCase {
  execute(): Promise<TResponseDto>;
}
