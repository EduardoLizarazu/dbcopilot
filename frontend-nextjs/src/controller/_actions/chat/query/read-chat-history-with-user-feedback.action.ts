"use server";

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
export async function ReadChatHistoryWithUserFeedback(): Promise<
  TReadHistoryPrompt[]
> {
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
    const data = await response.json();
    console.log("Chat history fetched successfully:", data);
    return data.map((chat: any) => ({
      ...chat,
      id_prompt: chat.prompt_id,
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
