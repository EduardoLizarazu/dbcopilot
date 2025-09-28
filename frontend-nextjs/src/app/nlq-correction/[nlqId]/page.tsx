import { getNlqDetailAction } from "@/controller/_actions/nlq/get-details";
import NlqCorrectionClient from "./client";

type Props = { params: { nlqId: string } };

export default async function NlqCorrectionPage({ params }: Props) {
  // Fetch by ID both NLQ and its Feedback; and error

  const detail = await getNlqDetailAction(params.nlqId);
  return <NlqCorrectionClient initial={detail} />;
}
