import {
  TCreateSchemaCtxBaseDto,
  TSchemaCtxBaseDto,
} from "../dtos/schemaCtx.dto";
import { IGenericMutationRepository } from "./generic.app.inter";

export interface ISchemaCtxRepository
  extends IGenericMutationRepository<
    TCreateSchemaCtxBaseDto,
    Partial<TSchemaCtxBaseDto>,
    TSchemaCtxBaseDto
  > {}
