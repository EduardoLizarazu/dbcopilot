export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { getRoleAction } from "@/controller/_actions/role/get";
import EditRoleClient from "./role.edit.client";
import { ReadRoleByIdAction } from "@/_actions/roles/read-by-id";

type Params = { roleId: string };

export default async function EditRolePage({ params }: { params: Params }) {
  console.log("EditRolePage params:", await params);
  const role = await ReadRoleByIdAction(params.roleId);
  if (!role) {
    // You could render a nicer UI instead of notFound()
    notFound();
  }
  return <EditRoleClient initialRole={role} />;
}
