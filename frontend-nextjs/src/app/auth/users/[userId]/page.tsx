import { notFound } from "next/navigation";
import { getUserAction } from "@/controller/_actions/user/get";
import { listRolesForUserForm } from "@/controller/_actions/user/roles";
import UserEditClient from "./user.edit.client";

type Params = { userId: string };

export default async function UserEditPage({ params }: { params: Params }) {
  const [user, roles] = await Promise.all([
    getUserAction(params.userId),
    listRolesForUserForm(),
  ]);

  if (!user) notFound();
  return <UserEditClient initialUser={user} roles={roles} />;
}
