import { schemaCtxDiff } from "../const/schemaCtxDiff";

export type TSchemaCtxDiff = typeof schemaCtxDiff;
export enum SchemaCtxDiffStatus {
  UN_CHANGE = 0,
  NEW = 1,
  DELETE = 2,
  UPDATE = 3,
}
