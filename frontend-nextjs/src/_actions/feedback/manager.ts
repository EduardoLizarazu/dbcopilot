import { CreateFeedbackAction } from "./create.action";
import { DeleteFeedbackAction } from "./delete.action";
import { ReadFeedbackByIdAction } from "./read-by-id.action";
import { UpdateFeedbackAction } from "./update.action";

/**
 * 1. If feedbackId is provided, try to read existing feedback.
 *    - If found, update it with new isGood and comment.
 *    - If not found, create new feedback.
 * 2. If no comment and isGood provided, delete feedback.
 */

export async function ManageFeedbackAction(params: {
  feedbackId: string | null;
  nlqQaId: string;
  isGood: boolean | null;
  comment: string | null;
}): Promise<{ id: string | null }> {
  try {
    // Update feedback
    if (
      params.feedbackId !== null &&
      params.isGood !== null &&
      params.comment !== null
    ) {
      const res = await UpdateFeedbackAction({
        id: params.feedbackId,
        nlqQaId: params.nlqQaId,
        isGood: params.isGood,
        comment: params.comment,
      });
      return { id: res.data.id };
    }
    // Create feedback
    if (
      params.feedbackId === null &&
      params.isGood !== null &&
      params.comment !== null
    ) {
      const res = await CreateFeedbackAction({
        nlqQaId: params.nlqQaId,
        isGood: params.isGood,
        comment: params.comment,
      });
      return { id: res.data.id };
    }

    // Delete feedback
    if (
      params.feedbackId !== null &&
      params.isGood === null &&
      params.comment === null
    ) {
      await DeleteFeedbackAction(params.feedbackId);
      return { id: null };
    }
    return { id: null };
  } catch (error) {
    console.error("Error managing feedback:", error);
    throw new Error("Failed to manage feedback");
  }
}
