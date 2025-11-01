import VbdSplitterClient from "./client";
import { ReadAllVbdSplitterWithUserAction } from "@/_actions/vbd-splitter/read-all-with-user.action";

export default async function VbdSplitterPage() {
  const initial = await ReadAllVbdSplitterWithUserAction();
  return <VbdSplitterClient initialRows={initial.data} />;
}
