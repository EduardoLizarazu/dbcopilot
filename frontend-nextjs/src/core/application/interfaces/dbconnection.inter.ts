import {
  TCreateDbConnectionDto,
  TDbConnectionOutRequestDto,
  TDbConnectionOutRequestDtoWithVbd,
  TUpdateDbConnectionDto,
} from "../dtos/dbconnection.dto";
import { IGenericMutationRepository } from "./generic.app.inter";

export interface IDbConnectionRepository
  extends IGenericMutationRepository<
    TCreateDbConnectionDto,
    TUpdateDbConnectionDto,
    TDbConnectionOutRequestDto
  > {
  findByName(name: string): Promise<TDbConnectionOutRequestDto | null>;
  findByFields(
    data: Partial<TCreateDbConnectionDto>
  ): Promise<TDbConnectionOutRequestDto | null>;
  findAllWithVbd(): Promise<TDbConnectionOutRequestDtoWithVbd[]>;
  findWithVbdById(
    id: string
  ): Promise<TDbConnectionOutRequestDtoWithVbd | null>;
}
