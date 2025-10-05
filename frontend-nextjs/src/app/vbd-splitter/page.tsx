import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";
import VbdIndexClient from "./client";

export default async function VbdIndexPage() {
  const initial = await ReadAllVbdSplitterAction();
  console.log("VbdIndexPage: Initial data fetched", initial);
  return <VbdIndexClient initialRows={initial.data} />;
}
