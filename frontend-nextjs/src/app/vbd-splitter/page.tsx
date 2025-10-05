import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";
import VbdSplitterClient from "./client";

export default async function VbdSplitterPage() {
  const initial = await ReadAllVbdSplitterAction();
  return <VbdSplitterClient initialRows={initial.data} />;
}
