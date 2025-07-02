import { HistoryTableHead } from "@/components/chat/history/historyTableHead";
import { ReadChatHistoryWithUserFeedback } from "@/controller/_actions/chat/query/read-chat-history-with-user-feedback.action";
import { ReadChatHistory } from "@/controller/_actions/chat/query/read-chat-history.chat.query";
import { CircularProgress, Container, Typography } from "@mui/material";
import { Suspense } from "react";

type TReadHistoryPrompt = {
  prompt_id: number;
  prompt: string;
  is_user_deletion: boolean; // Assuming this is a boolean flag
  sql_query: string;
  message_error: string | null;
  id_user: string;
  hf_id: number | null;
  is_like: boolean | null;
  message: string | null;
  user_name: string;
  username: string;
};

export default async function RolesPage() {
  const data: TReadHistoryPrompt[] = await ReadChatHistoryWithUserFeedback();
  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Roles</Typography>
        <HistoryTableHead fetchedData={data} />
      </Container>
    </Suspense>
  );
}
