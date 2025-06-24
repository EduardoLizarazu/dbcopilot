"use client";

import { SingleChat } from "@/components/chat/single_chat";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { ReadSingleChatHistory } from "@/controller/_actions/chat/query/read-single-chat-history.chat.query";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{
    chatid: string;
  }>;
}

export default function ChatIdPage({ params }: Props) {
  const router = useRouter();
  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();
  const [conversation, setConversation] = React.useState<{
    chatId: string;
    prompt: string;
    results: any;
    row_count: number;
  } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { chatid } = await params;
        console.log("chatid", chatid);
        const response = await ReadSingleChatHistory(chatid);
        setConversation({
          chatId: response.chatId,
          prompt: response.prompt,
          results: response.results,
          row_count: response.row_count,
        });
        console.log("Single chat history loaded response:", response);
        console.log("Single chat history loaded conversation:", conversation);
      } catch (error) {
        console.error("Error loading single chat history:", error);
        setConversation(null);
        setFeedback({
          isActive: true,
          severity: "error",
          message: "Failed to load conversation. Please try again.",
        });
        resetFeedBack();
        router.push("/chat"); // Redirect to chat list if loading fails
      }
    })();
  }, [params]);

  if (!conversation) {
    return <div>Loading conversation...</div>;
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SingleChat previousConversation={conversation} />
      </Suspense>
    </>
  );
}
