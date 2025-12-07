/**
 * Use case interface for pruning negative feedback entries:
 * 1. Fetch the nlqQaId entry.
 * 2. Identify if nlqQa.isGood=false entries exist.
 * 3. Check by question+query hash if multiple negative feedbacks exist.
 * 4. If duplicates found, retain only the most recent entry, delete others.
 * 5. Check if query hash exists in negative feedbacks.
 * 6. If duplicates found, retain only the most recent entry, delete others.
 * 7. Check if any feedback is found on the (negative) knowledge base.
 * 8. If found and <condition>, retain only the most recent entry, delete others, else retain all.
 * 9. Return decision.
 *
 * Note: Ones it's corrected, it must be remove from (negative) knowledge base as well.
 * Note: Remember to implement the hash on the creation of negative feedbacks.
 * Note: Remember to include the IGNORE LOGIC
 */

export interface IPruneNlqQaNegativeDuplicateFlow {
  flow(data: {
    currQuestion: string;
    currQuery: string;
    currNamespace: string;
  }): Promise<void>;
}
