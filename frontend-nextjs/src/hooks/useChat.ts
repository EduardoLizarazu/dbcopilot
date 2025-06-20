// hooks/useChat.ts
"use client";
import { useState, useCallback } from "react";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Replace this with your actual API call
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.content,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);

        // Fallback response
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "I'm sorry, I'm having trouble responding right now. Please try again later.",
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const regenerateLastMessage = useCallback(async () => {
    if (messages.length < 2) return;

    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");

    if (!lastUserMessage) return;

    // Remove the last assistant message and regenerate
    setMessages((prev) =>
      prev.filter(
        (msg) =>
          !(
            msg.role === "assistant" &&
            msg.timestamp > lastUserMessage.timestamp
          )
      )
    );

    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    regenerateLastMessage,
  };
};
