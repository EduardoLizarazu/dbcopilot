export const runtime = "nodejs";

import { getNlqGoodDetailAction } from "@/controller/_actions/nlq/get-good-detail";
import NlqGoodEditClient from "./client";

export default async function NlqGoodEditPage({
  params,
}: {
  params: { nlqId: string };
}) {
  const initial = await getNlqGoodDetailAction(params.nlqId);
  return <NlqGoodEditClient initial={initial} />;
}
