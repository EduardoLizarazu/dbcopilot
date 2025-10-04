import {
  TCreateVbdDto,
  TUpdateVbdDto,
  TVbdOutRequestDto,
} from "../dtos/vbd.dto";
import { IGenericMutationRepository } from "./generic.app.inter";

export interface IVbdSplitterRepository
  extends IGenericMutationRepository<
    TCreateVbdDto,
    TUpdateVbdDto,
    TVbdOutRequestDto
  > {
  findByName(name: string): Promise<TVbdOutRequestDto | null>;
}
