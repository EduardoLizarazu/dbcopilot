"use server";
export type TCreatePromptInput = {
  prompt: string;
};

export type TCreatePromptOutput = {
  result: Record<string, unknown>[];
  error?: string | null;
};

export async function CreatePrompt(
  input: TCreatePromptInput
): Promise<TCreatePromptOutput> {
  try {
    console.log("create prompt with connection id: ", input.prompt);
    // validate length of prompt trim
    if (input.prompt.trim().length < 5) {
      throw new Error("Prompt must be at least 5 characters long.");
    }

    const response = await fetch(`${process.env.BASE_URL_MODEL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return {
        result: [],
        error: `Error creating prompt: ${response.statusText}`,
      };
    }
    const data = await response.json();
    console.log("response create prompt : ", data);
    return {
      result: data.results || [],
    };
  } catch (error) {
    console.error("Error creating prompt with connection ID:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
