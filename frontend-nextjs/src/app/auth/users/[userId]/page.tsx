import { notFound } from "next/navigation";
import { getUserAction } from "@/controller/_actions/user/get";
import { listRolesForUserForm } from "@/controller/_actions/user/roles";
import UserEditClient from "./user.edit.client";
import { ReadUserByIdAction } from "@/_actions/users/read-by-id.action";
import { ReadAllRolesAction } from "@/_actions/roles/read-all.action";

type Params = { userId: string };

export default async function UserEditPage({ params }: { params: Params }) {
  const [user, roles] = await Promise.all([
    ReadUserByIdAction(params.userId),
    ReadAllRolesAction(),
  ]);

  if (!user) notFound();
  return <UserEditClient initialUser={user.data} roles={roles.data} />;
}
