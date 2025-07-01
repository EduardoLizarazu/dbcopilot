"use server";

type THumanFeedback = {
  promptId: number;
  isLike: boolean;
  feedbackTxt: string;
};

export async function CreateHumanFeedbackAction(input: THumanFeedback) {
  try {
    const inputFormatted = {
      promptId: input.promptId,
      message: input.feedbackTxt || "",
      isLike: input.isLike,
    };

    const response = await fetch(`${process.env.BASE_URL}/human-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputFormatted),
    });
    if (!response.ok) {
      throw new Error(`Error on creating human-feedback action`);
    }
  } catch (error) {
    console.error("Error creating feedback:", error);
  }
}
