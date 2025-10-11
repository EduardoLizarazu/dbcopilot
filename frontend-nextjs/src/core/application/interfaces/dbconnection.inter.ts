import {
  TCreateDbConnectionDto,
  TDbConnectionOutRequestDto,
  TDbConnectionOutRequestDtoWithVbd,
  TDbConnectionOutRequestDtoWithVbAndUser,
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
  findAllWithVbdAndUser(): Promise<TDbConnectionOutRequestDtoWithVbAndUser[]>;
  findWithVbdAndUserById(
    id: string
  ): Promise<TDbConnectionOutRequestDtoWithVbAndUser | null>;
  findAllHaveVbd(): Promise<TDbConnectionOutRequestDtoWithVbd[]>;
  findHaveVbdById(
    id: string
  ): Promise<TDbConnectionOutRequestDtoWithVbd | null>;
  findAllByVbdSplitterId(data: {
    vbdSplitterIdrId: string;
  }): Promise<TDbConnectionOutRequestDto[]>;
}
