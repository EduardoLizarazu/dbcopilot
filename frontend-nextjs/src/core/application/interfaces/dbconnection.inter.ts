import {
  TCreateDbConnectionDto,
  TDbConnectionOutRequestDto,
  TUpdateDbConnectionDto,
} from "../dtos/dbconnection.dto";
import { IGenericMutationRepository } from "./generic.app.inter";

export interface IVbdSplitterRepository
  extends IGenericMutationRepository<
    TCreateDbConnectionDto,
    TUpdateDbConnectionDto,
    TDbConnectionOutRequestDto
  > {}
