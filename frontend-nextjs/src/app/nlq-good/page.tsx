import { listNlqGoodAction } from "@/controller/_actions/nlq/list-good";
import NlqGoodClient from "./client";

export default async function NlqGoodPage() {
  const initial = await listNlqGoodAction(300);
  return <NlqGoodClient initialRows={initial} />;
}
