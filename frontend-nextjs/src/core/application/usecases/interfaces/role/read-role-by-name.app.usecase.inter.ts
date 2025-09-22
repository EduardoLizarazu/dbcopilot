import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface IReadRoleByNameAppUseCase {
  execute(name: string): Promise<TResponseDto>;
}
