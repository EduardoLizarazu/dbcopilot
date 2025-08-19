import { getNlqDetailAction } from "@/controller/_actions/nlq/get-details";
import NlqCorrectionClient from "./client";

type Props = { params: { nlqId: string } };

export default async function NlqCorrectionPage({ params }: Props) {
  const detail = await getNlqDetailAction(params.nlqId);
  return <NlqCorrectionClient initial={detail} />;
}
