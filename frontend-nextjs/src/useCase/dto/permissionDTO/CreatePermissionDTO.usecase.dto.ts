import { ReadPermissionOutput } from "../index.usecase.dto";

export type CreatePermissionInput = Omit<ReadPermissionOutput, "id">;
