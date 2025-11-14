"use server";

import EditRoleClient from "./role.edit.client";
import { ReadRoleByIdAction } from "@/_actions/roles/read-by-id";
import { NotFound } from "@/components/shared/notFound";

type Params = { roleId: string };

export default async function EditRolePage({ params }: { params: Params }) {
  console.log("EditRolePage params:", await params);
  const role = await ReadRoleByIdAction(await params.roleId);
  console.log("EditRolePage role data:", role);
  if (role.data === null) {
    // You could render a nicer UI instead of notFound()
    console.log("Role not found, rendering 404 page.");
    return <NotFound />;
  }
  return <EditRoleClient initialRole={role.data} />;
}
