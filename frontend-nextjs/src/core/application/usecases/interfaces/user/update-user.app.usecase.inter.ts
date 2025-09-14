import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { TUpdateUserDto } from "@/core/application/dtos/user.domain.dto";

export interface IUpdateUserAppUseCase {
  execute(id: string, data: TUpdateUserDto): Promise<TResponseDto>;
}
