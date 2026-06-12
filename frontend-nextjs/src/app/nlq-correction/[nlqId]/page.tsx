import { NotFound } from "@/components/shared/notFound";
import NlqCorrectionClient from "./client";
import { ReadNlqQaBadByIdAction } from "@/_actions/nlq-qa-correction/read-by-id.action";

type Props = { params: { nlqId: string } };

export default async function NlqCorrectionPage({ params }: Props) {
  const { nlqId } = await params;

  const detail = await ReadNlqQaBadByIdAction(await nlqId);
  if (detail.data === null) return <NotFound />;
  return <NlqCorrectionClient initial={detail.data} />;
}
