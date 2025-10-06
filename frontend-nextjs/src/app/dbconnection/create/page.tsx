import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";
import DbConnectionClient from "./client";

export default async function CreateDbConnectionPage() {
  const vbd_splitter_data = await ReadAllVbdSplitterAction();

  return <DbConnectionClient vbd_splitter={vbd_splitter_data.data} />;
}
