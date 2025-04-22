"use server";
export type TCreatePromptCmdWithConnIdInput = {
  connectionId: number;
  prompt: string;
};
export type TCreatePromptCmdWithConnIdOutput = {
  data: Record<string, unknown>[];
  final_query: string;
};
export async function CreatePromptCmdWithConnId(
  input: TCreatePromptCmdWithConnIdInput
): Promise<TCreatePromptCmdWithConnIdOutput> {
  try {
    console.log(
      "create prompt with connection id: ",
      input.connectionId,
      input.prompt
    );

    // Validate input
    if (!input.connectionId || !input.prompt) {
      throw new Error("Invalid input: connectionId and prompt are required.");
    }

    // validate length of prompt trim
    if (input.prompt.trim().length < 5) {
      throw new Error("Prompt must be at least 5 characters long.");
    }

    const response = await fetch(`${process.env.BASE_URL}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to create prompt");
    }
    const data: {
      data: Record<string, unknown>[];
      generated_queries: string[];
      final_query: string;
    } = await response.json();
    console.log("response create prompt with connection id: ", data);
    return {
      data: data.data,
      final_query: data.final_query,
    };
  } catch (error) {
    console.error("Error creating prompt with connection ID:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
