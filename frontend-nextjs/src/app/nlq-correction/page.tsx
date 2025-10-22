export const runtime = "nodejs";

import NlqCorrectionsClient from "./nlq-correction.client";
import { ReadAllNlqQaBadAction } from "@/_actions/nlq-qa-correction/read-all.action";

export default async function ReadAllNlqQaForBad() {
  const nlqAllBad = await ReadAllNlqQaBadAction("");
  return <NlqCorrectionsClient initialRows={nlqAllBad.data} />;
}
