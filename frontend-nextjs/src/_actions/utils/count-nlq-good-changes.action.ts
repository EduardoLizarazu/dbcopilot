import {
  NlqQaGoodWithExecutionStatus,
  TNlqQaGoodWithExecutionDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";

// export enum NlqQaGoodWithExecutionStatus {
//   FAILED = 0,
//   OK = 1,
//   NOTHING = 2,
//   CORRECTED = 3,
//   TO_DELETE = 4,
//   UNKNOWN = -1,
// }

export type TCountNlqGoodChangesResult = {
  countFailed: number;
  countOk: number;
  countNothing: number;
  countCorrected: number;
  countToDelete: number;
  countUnknown: number;
};

export async function CountNlqGoodChangesAction(data: {
  nlqGoodChanges: TNlqQaGoodWithExecutionDto[];
}): Promise<TCountNlqGoodChangesResult> {
  const { nlqGoodChanges } = data;
  let countFailed = 0;
  let countOk = 0;
  let countNothing = 0;
  let countCorrected = 0;
  let countToDelete = 0;
  let countUnknown = 0;

  for (const nlqGood of nlqGoodChanges) {
    switch (nlqGood.executionStatus) {
      case NlqQaGoodWithExecutionStatus.FAILED:
        countFailed++;
        break;
      case NlqQaGoodWithExecutionStatus.OK:
        countOk++;
        break;
      case NlqQaGoodWithExecutionStatus.NOTHING:
        countNothing++;
        break;
      case NlqQaGoodWithExecutionStatus.CORRECTED:
        countCorrected++;
        break;
      case NlqQaGoodWithExecutionStatus.TO_DELETE:
        countToDelete++;
        break;
      case NlqQaGoodWithExecutionStatus.UNKNOWN:
        countUnknown++;
        break;
    }
  }
  return {
    countFailed,
    countOk,
    countNothing,
    countCorrected,
    countToDelete,
    countUnknown,
  };
}
