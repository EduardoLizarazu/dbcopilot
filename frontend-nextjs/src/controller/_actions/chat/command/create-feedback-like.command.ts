"use server";

export async function CreateFeedbackLikeCmd(promptId: number, like: boolean) {
  try {
    return {
      status: 201,
    };
  } catch (error) {
    console.error("Error creating feedback like:", error);
    return {
      status: 500,
    };
  }
}
