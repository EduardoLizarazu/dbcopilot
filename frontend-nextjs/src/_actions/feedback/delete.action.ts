"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { domain } from "@/utils/constants";

export async function DeleteFeedbackAction(id: string): Promise<void> {
  console.log("Deleting feedback (test)...", id);

  const feedbackRes = await fetch(`${domain}/api/feedback/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", feedbackRes);

  if (!feedbackRes.ok) {
    const errorData = await feedbackRes.json();
    console.error(
      "Error deleting feedback:",
      errorData.message || feedbackRes.statusText
    );
    throw new Error(
      `Failed to delete feedback: ${errorData.message || feedbackRes.statusText}`
    );
  }
}
