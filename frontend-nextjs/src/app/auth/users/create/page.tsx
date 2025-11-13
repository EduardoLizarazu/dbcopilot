import UsersCreateClient from "./users.create.client";
import { ReadAllRolesAction } from "@/_actions/roles/read-all.action";

export default async function UsersCreatePage() {
  const roles = await ReadAllRolesAction(); // SSR: ensures first paint has data
  return <UsersCreateClient roles={roles.data} />;
}
