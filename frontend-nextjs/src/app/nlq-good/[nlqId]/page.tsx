export const runtime = "nodejs";

import { NotFound } from "@/components/shared/notFound";
import NlqGoodEditClient from "../create/client";
import { ReadNlqQaGoodByIdAction } from "@/_actions/nlq-qa-good/read-by-id.action";

export default async function NlqGoodEditPage({
  params,
}: {
  params: { nlqId: string };
}) {
  const initial = await ReadNlqQaGoodByIdAction(await params.nlqId);
  if (initial.data === null) return <NotFound />;
  return <NlqGoodEditClient initial={initial.data} />;
}
