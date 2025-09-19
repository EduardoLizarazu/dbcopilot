import { TResponseDto } from "@/core/application/dtos/response.app.dto";

export interface IReadRoleByNameAppUseCase {
  execute(name: string): Promise<TResponseDto>;
}
