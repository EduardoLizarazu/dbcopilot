import { TCreateNlqQaGoodDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface ICreateNlqQaGoodUseCase {
  execute(data: TCreateNlqQaGoodDto): Promise<TResponseDto>;
}
