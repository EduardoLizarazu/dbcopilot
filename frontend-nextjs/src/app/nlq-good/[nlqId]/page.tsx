export const runtime = "nodejs";

import { getNlqGoodDetailAction } from "@/controller/_actions/nlq/get-good-detail";
import NlqGoodEditClient from "./client";
import { ReadNlqQaGoodByIdAction } from "@/_actions/nlq-qa-good/read-by-id.action";

export default async function NlqGoodEditPage({
  params,
}: {
  params: { nlqId: string };
}) {
  // const initial = await getNlqGoodDetailAction(params.nlqId);
  const initial = await ReadNlqQaGoodByIdAction(params.nlqId);
  return <NlqGoodEditClient initial={initial.data} />;
}
