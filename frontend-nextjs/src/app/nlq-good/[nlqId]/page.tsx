export const runtime = "nodejs";

import NlqGoodEditClient from "../create/client";
import { ReadNlqQaGoodByIdAction } from "@/_actions/nlq-qa-good/read-by-id.action";

export default async function NlqGoodEditPage({
  params,
}: {
  params: { nlqId: string };
}) {
  const initial = await ReadNlqQaGoodByIdAction(params.nlqId);
  return <NlqGoodEditClient initial={initial.data} />;
}
