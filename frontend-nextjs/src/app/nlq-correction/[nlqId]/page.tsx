import { NotFound } from "@/components/shared/notFound";
import NlqCorrectionClient from "./client";
import { ReadNlqQaBadByIdAction } from "@/_actions/nlq-qa-correction/read-by-id.action";

type Props = { params: { nlqId: string } };

export default async function NlqCorrectionPage({ params }: Props) {
  const detail = await ReadNlqQaBadByIdAction(await params.nlqId);
  if (detail.data === null) return <NotFound />;
  return <NlqCorrectionClient initial={detail.data} />;
}
