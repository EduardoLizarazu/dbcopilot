export const runtime = "nodejs";

import { listNlqCorrectionsAction } from "@/controller/_actions/nlq/list-correction";
import NlqCorrectionsClient from "./nlq-correction.client";

export default async function NlqCorrectionsPage() {
  const initial = await listNlqCorrectionsAction({ limit: 200 });
  return <NlqCorrectionsClient initialRows={initial} />;
}
