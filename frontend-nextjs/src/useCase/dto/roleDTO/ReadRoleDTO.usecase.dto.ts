import { ReadPermissionOutput } from "../index.usecase.dto";

export interface ReadRoleOutput {
  id: number;
  name: string;
  permissions: ReadPermissionOutput[];
}
