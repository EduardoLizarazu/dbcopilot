"use client";

import { SingleChat } from "@/components/chat/single_chat";
import React from "react";

interface Props {
  params: Promise<{
    chatid: string;
  }>;
}

export default function ChatIdPage({ params }: Props) {
  React.useEffect(() => {
    (async () => {
      const { chatid } = await params;
      console.log("chatid", chatid);
    })();
  }, [params]);

  return (
    <>
      <SingleChat />
    </>
  );
}
