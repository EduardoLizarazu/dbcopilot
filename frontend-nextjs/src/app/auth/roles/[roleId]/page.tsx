export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { getRoleAction } from "@/controller/_actions/role/get";
import EditRoleClient from "./role.edit.client";

type Params = { roleId: string };

export default async function EditRolePage({ params }: { params: Params }) {
  const role = await getRoleAction(params.roleId);
  if (!role) {
    // You could render a nicer UI instead of notFound()
    notFound();
  }
  return <EditRoleClient initialRole={role} />;
}
