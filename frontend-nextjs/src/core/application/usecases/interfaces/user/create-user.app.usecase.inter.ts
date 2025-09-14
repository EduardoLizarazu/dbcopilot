import { TResponseDto } from "@/core/application/dtos/response.domain.dto";
import { TCreateUserDto } from "@/core/application/dtos/user.domain.dto";

export interface ICreateUserAppUseCase {
  execute(data: TCreateUserDto): Promise<TResponseDto>;
}
