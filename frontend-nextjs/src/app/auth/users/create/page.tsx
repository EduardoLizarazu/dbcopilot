import { listRolesForUserForm } from "@/controller/_actions/user/roles";
import UsersCreateClient from "./users.create.client";

export default async function UsersCreatePage() {
  const roles = await listRolesForUserForm(); // SSR: ensures first paint has data
  return <UsersCreateClient roles={roles} />;
}
