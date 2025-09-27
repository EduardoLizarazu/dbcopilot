"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { domain } from "@/utils/constants";

export async function DeleteFeedbackAction(id: string): Promise<void> {
  console.log("Deleting feedback (test)...", id);

  const feedbackRes = await fetch(`${domain}/api/feedback/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", feedbackRes);

  if (!feedbackRes.ok) {
    throw new Error(`Failed to delete feedback: ${feedbackRes.statusText}`);
  }
}
