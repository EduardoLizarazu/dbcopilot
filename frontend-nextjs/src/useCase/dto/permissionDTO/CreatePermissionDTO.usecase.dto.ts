import { ReadPermissionOutput } from "../index.usecase.dto";

export interface CreatePermissionInput
  extends Omit<ReadPermissionOutput, "id"> {}
