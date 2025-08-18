import { listNlqHistoryAction } from "@/controller/_actions/nlq/list";
import ChatHistoryClient from "./history.client";

export default async function ChatHistoryPage() {
  const initial = await listNlqHistoryAction({
    includeDeleted: false,
    limit: 200,
  });
  return <ChatHistoryClient initialRows={initial} />;
}
