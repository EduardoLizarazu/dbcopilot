import { NotFound } from "@/components/shared/notFound";
import UpdateVbdSplitterClient from "../create/client";
import { ReadVbdSplitterByIdAction } from "@/_actions/vbd-splitter/read-by-id.action";

export default async function UpdateVbdSplitterPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch data on the server side
  const initial = await ReadVbdSplitterByIdAction(await params.id);

  if (initial.data === null) return <NotFound />;

  // Render the client component with the fetched data
  return <UpdateVbdSplitterClient initial={initial.data} />;
}
