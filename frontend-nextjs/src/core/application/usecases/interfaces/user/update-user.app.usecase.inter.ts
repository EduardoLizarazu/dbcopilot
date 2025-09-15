import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { TUpdateUserDto } from "@/core/application/dtos/user.app.dto";

export interface IUpdateUserAppUseCase {
  execute(id: string, data: TUpdateUserDto): Promise<TResponseDto>;
}
