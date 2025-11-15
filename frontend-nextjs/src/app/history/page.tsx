import { ReadAllNlqHistoryAction } from "@/_actions/nlq-qa/history/read-history.action";
import HistoryClient from "./client";

export default async function ChatHistoryPage() {
  const initial = await ReadAllNlqHistoryAction();

  if (!initial.ok) {
    return <div>Error loading history: {initial.message}</div>;
  }

  return <HistoryClient initialRows={initial.data} />;
}
