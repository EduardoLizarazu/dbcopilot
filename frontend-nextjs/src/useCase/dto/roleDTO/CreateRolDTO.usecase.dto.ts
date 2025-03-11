export interface CreateRolInput {
  name: string;
  permissions: { id: number; name: string; description: string }[];
}
