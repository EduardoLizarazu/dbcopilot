import NlqGoodClient from "./client";
import { ReadAllNlqQaGoodAction } from "@/_actions/nlq-qa-good/read-all.action";

export default async function NlqGoodPage() {
  const initial = await ReadAllNlqQaGoodAction();
  return <NlqGoodClient initialRows={initial.data} />;
}
