import UpdateDbConnectionClient from "../create/client";
import { ReadDbConnectionByIdAction } from "@/_actions/dbconnection/read-by-id.action";

export default async function EditDbConnectionPage({
  params,
}: {
  params: { id: string };
}) {
  const initialData = await ReadDbConnectionByIdAction(params.id);
  return <UpdateDbConnectionClient initialData={initialData?.data} />;
}
