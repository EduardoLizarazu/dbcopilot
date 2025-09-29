import { getNlqDetailAction } from "@/controller/_actions/nlq/get-details";
import NlqCorrectionClient from "./client";
import { ReadNlqQaBadByIdAction } from "@/_actions/nlq-qa-correction/read-by-id.action";

type Props = { params: { nlqId: string } };

export default async function NlqCorrectionPage({ params }: Props) {
  // Fetch by ID both NLQ and its Feedback; and error

  const detail = await ReadNlqQaBadByIdAction(params.nlqId);
  return <NlqCorrectionClient initial={detail.data} />;
}
