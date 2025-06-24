"use server";

type TReadSingleChatHistoryOutput = {
  chatId: string;
  prompt: string;
  results: Record<string, unknown>[];
  row_count: number;
};

export async function ReadSingleChatHistory(
  chatId: string
): Promise<TReadSingleChatHistoryOutput> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/chat/${chatId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching chat history: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Single chat history fetched successfully:", data);
    return {
      chatId: data.chatId,
      prompt: data.prompt,
      results: data.results,
      row_count: data.row_count,
    };
  } catch (error) {
    console.error("Error fetching single chat history:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
