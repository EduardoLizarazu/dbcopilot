import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IReadAllRoleAppUseCase {
  execute(): Promise<TResponseDto>;
}
