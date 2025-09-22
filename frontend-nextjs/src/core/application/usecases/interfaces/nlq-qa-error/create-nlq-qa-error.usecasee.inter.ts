import {
  TCreateNlqQaErrorDto,
  TNlqQaErrorOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface ICreateNlqQaErrorUseCase {
  execute(data: TCreateNlqQaErrorDto): Promise<TResponseDto<string>>;
}
