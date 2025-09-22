import { TNlqInformationData } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";

export interface INlqQaInformationExecuteQueryUseCase {
  execute(
    query: string,
    dateParams?: { start: Date; end: Date }
  ): Promise<TResponseDto<TNlqInformationData>>;
}
