import { listNlqGoodAction } from "@/controller/_actions/nlq/list-good";
import NlqGoodClient from "./client";
import { ReadAllNlqQaGoodAction } from "@/_actions/nlq-qa-good/read-all.action";

export default async function NlqGoodPage() {
  // const initial = await listNlqGoodAction(300);
  const initial = await ReadAllNlqQaGoodAction();
  return <NlqGoodClient initialRows={initial.data} />;
}
