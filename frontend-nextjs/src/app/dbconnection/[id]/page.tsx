import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";
import UpdateDbConnectionClient from "../create/client";
import { ReadDbConnectionByIdAction } from "@/_actions/dbconnection/read-by-id.action";

export default async function EditDbConnectionPage({
  params,
}: {
  params: { id: string };
}) {
  const initialData = await ReadDbConnectionByIdAction(params.id);
  const vbd_splitter_data = await ReadAllVbdSplitterAction();
  return (
    <UpdateDbConnectionClient
      initial={initialData?.data}
      vbdSplitters={vbd_splitter_data.data}
    />
  );
}
