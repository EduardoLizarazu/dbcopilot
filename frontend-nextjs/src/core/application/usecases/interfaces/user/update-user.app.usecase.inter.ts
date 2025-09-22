import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TUpdateUserDto } from "@/core/application/dtos/auth/user.app.dto";

export interface IUpdateUserAppUseCase {
  execute(id: string, data: TUpdateUserDto): Promise<TResponseDto>;
}
