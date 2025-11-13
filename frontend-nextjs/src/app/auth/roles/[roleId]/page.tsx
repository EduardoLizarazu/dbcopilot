export const runtime = "nodejs";

import { notFound } from "next/navigation";
import EditRoleClient from "./role.edit.client";
import { ReadRoleByIdAction } from "@/_actions/roles/read-by-id";

type Params = { roleId: string };

export default async function EditRolePage({ params }: { params: Params }) {
  console.log("EditRolePage params:", await params);
  const role = await ReadRoleByIdAction(params.roleId);
  if (!role?.data) {
    // You could render a nicer UI instead of notFound()
    notFound();
  }
  return <EditRoleClient initialRole={role.data} />;
}
