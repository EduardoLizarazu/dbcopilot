import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { TCreateUserDto } from "@/core/application/dtos/auth/user.app.dto";

export interface ICreateUserAppUseCase {
  execute(data: TCreateUserDto): Promise<TResponseDto>;
}
