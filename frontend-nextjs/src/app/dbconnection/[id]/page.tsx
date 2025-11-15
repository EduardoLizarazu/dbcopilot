import { NotFound } from "@/components/shared/notFound";
import UpdateDbConnectionClient from "../create/client";
import { ReadDbConnectionByIdAction } from "@/_actions/dbconnection/read-by-id.action";

export default async function EditDbConnectionPage({
  params,
}: {
  params: { id: string };
}) {
  const initialData = await ReadDbConnectionByIdAction(params.id);

  if (!initialData.data) {
    return <NotFound />;
  }
  return <UpdateDbConnectionClient initial={initialData?.data} />;
}
