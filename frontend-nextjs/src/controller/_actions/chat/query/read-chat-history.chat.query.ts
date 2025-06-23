"use server";

type TReadChatHistoryOutput = {
  id: number;
  prompt: string;
};

export async function ReadChatHistory() {
  try {
    const response = await fetch(`${process.env.BASE_URL}/chat`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }
    const data: TReadChatHistoryOutput[] = await response.json();
    console.log("Chat history fetched successfully:", data);
    return data.map((chat) => ({
      id: chat.id,
      prompt: chat.prompt,
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
