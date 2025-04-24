"use server";
export async function CreateFeedbackDisLikeCmd(
  promptId: number,
  feedbackTxt: string
) {
  try {
    const input = {
      promptId: promptId,
      message: feedbackTxt,
      isLike: false,
    };

    const response = await fetch(`${process.env.BASE_URL}/human-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const data = await response.json();

    console.log("response create feedback dislike: ", data);

    return {
      status: data.status,
    };
  } catch (error) {
    console.error("Error creating feedback dislike:", error);
    return {
      status: 500,
    };
  }
}
