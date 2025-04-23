"use server";
export async function CreateFeedbackDisLikeCmd(
  promptId: number,
  feedbackTxt: string
) {
  try {
    const input = {
      promptId: promptId,
      feedback: feedbackTxt,
      isLike: false,
    };

    return {
      status: 201,
    };
  } catch (error) {
    console.error("Error creating feedback dislike:", error);
    return {
      status: 500,
    };
  }
}
