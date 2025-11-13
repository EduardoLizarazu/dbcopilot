import NlqCorrectionClient from "./client";
import { ReadNlqQaBadByIdAction } from "@/_actions/nlq-qa-correction/read-by-id.action";

type Props = { params: { nlqId: string } };

export default async function NlqCorrectionPage({ params }: Props) {
  const detail = await ReadNlqQaBadByIdAction(params.nlqId);
  return <NlqCorrectionClient initial={detail.data} />;
}
