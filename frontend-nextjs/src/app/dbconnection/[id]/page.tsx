import { NotFound } from "@/components/shared/notFound";
import UpdateDbConnectionClient from "../create/client";
import { ReadDbConnectionByIdAction } from "@/_actions/dbconnection/read-by-id.action";

export default async function EditDbConnectionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const initialData = await ReadDbConnectionByIdAction(await id);

  if (!initialData.data) {
    return <NotFound />;
  }
  return <UpdateDbConnectionClient initial={initialData?.data} />;
}
