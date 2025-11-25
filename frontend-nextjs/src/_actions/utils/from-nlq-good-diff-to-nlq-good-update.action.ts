import {
  NlqQaGoodWithExecutionStatus,
  TNlqQaGoodWithExecutionDto,
  TUpdateNlqQaGoodInRqDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";

// export enum NlqQaGoodWithExecutionStatus {
//   FAILED = 0,
//   OK = 1,
//   NOTHING = 2,
//   CORRECTED = 3,
//   TO_DELETE = 4,
//   UNKNOWN = -1,
// }

export async function FromNlqGoodDiffToNlqGood(data: {
  nlqGoodDiff: TNlqQaGoodWithExecutionDto[];
}): Promise<TUpdateNlqQaGoodInRqDto[]> {
  const nlqGoodDiff = data.nlqGoodDiff;

  const updateData = nlqGoodDiff.map((item) => {
    const executionStatus =
      item.executionStatus === NlqQaGoodWithExecutionStatus.CORRECTED
        ? NlqQaGoodWithExecutionStatus.OK
        : item.executionStatus;

    // Omit `newQuestion` and `newQuery` so they aren't present in the result
    // by using destructuring to remove them from the returned object.
    const { newQuestion, newQuery, ...rest } = item;

    return {
      ...rest,
      question: newQuestion || item.question,
      query: newQuery || item.query,
      executionStatus,
      isOnKnowledgeSource: !(
        item.executionStatus === NlqQaGoodWithExecutionStatus.TO_DELETE
      ),
    };
  });

  // Deep copy to ensure no references remain
  const deepCopiedUpdateData = JSON.parse(JSON.stringify(updateData));

  return deepCopiedUpdateData;
}
