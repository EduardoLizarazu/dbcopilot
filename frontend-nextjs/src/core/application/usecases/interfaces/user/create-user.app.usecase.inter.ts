import { TResponseDto } from "@/core/application/dtos/response.app.dto";
import { TCreateUserDto } from "@/core/application/dtos/user.app.dto";

export interface ICreateUserAppUseCase {
  execute(data: TCreateUserDto): Promise<TResponseDto>;
}
