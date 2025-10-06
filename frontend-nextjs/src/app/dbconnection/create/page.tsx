import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";
import DbConnectionClient from "./client";

export default async function CreateDbConnectionPage() {
  return <DbConnectionClient />;
}
