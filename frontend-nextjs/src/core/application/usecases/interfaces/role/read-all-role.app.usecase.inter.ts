import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadAllRoleAppUseCase {
  execute(): Promise<TResponseDto>;
}
