import UpdateVbdSplitterClient from "../create/client";
import { ReadVbdSplitterByIdAction } from "@/_actions/vbd-splitter/read-by-id.action";

export default async function UpdateVbdSplitterPage(params: { id: string }) {
  const initial = await ReadVbdSplitterByIdAction(params.id);
  return <UpdateVbdSplitterClient initial={initial.data} />;
}
