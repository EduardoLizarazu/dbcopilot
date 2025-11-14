import UserEditClient from "./user.edit.client";
import { ReadUserByIdAction } from "@/_actions/users/read-by-id.action";
import { ReadAllRolesAction } from "@/_actions/roles/read-all.action";
import { NotFound } from "@/components/shared/notFound";

type Params = { userId: string };

export default async function UserEditPage({ params }: { params: Params }) {
  const [user, roles] = await Promise.all([
    ReadUserByIdAction(params.userId),
    ReadAllRolesAction(),
  ]);

  if (!user.data) return <NotFound />;
  return <UserEditClient initialUser={user.data} roles={roles.data} />;
}
