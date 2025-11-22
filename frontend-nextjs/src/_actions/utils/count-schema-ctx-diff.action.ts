"use server";

import {
  SchemaCtxDiffStatus,
  TSchemaCtxDiffSchemaDto,
} from "@/core/application/dtos/schemaCtx.dto";

// export enum SchemaCtxDiffStatus {
//   UN_CHANGE = 0,
//   NEW = 1,
//   DELETE = 2,
//   UPDATE = 3,
// }

export type TCountSchemaCtxDiffResult = {
  countUnchanged: number;
  countNew: number;
  countDeleted: number;
  countUpdated: number;
};

export async function CountSchemaCtxDiffAction(data: {
  schemasCtxDiff: TSchemaCtxDiffSchemaDto[];
}): Promise<TCountSchemaCtxDiffResult> {
  const { schemasCtxDiff } = data;

  let countUnchanged = 0;
  let countNew = 0;
  let countDeleted = 0;
  let countUpdated = 0;

  for (const schemaDiff of schemasCtxDiff) {
    switch (schemaDiff.status) {
      case SchemaCtxDiffStatus.UN_CHANGE:
        countUnchanged++;
        break;
      case SchemaCtxDiffStatus.NEW:
        countNew++;
        break;
      case SchemaCtxDiffStatus.DELETE:
        countDeleted++;
        break;
      case SchemaCtxDiffStatus.UPDATE:
        countUpdated++;
        break;
    }
    for (const tableDiff of schemaDiff.tables) {
      switch (tableDiff.status) {
        case SchemaCtxDiffStatus.UN_CHANGE:
          countUnchanged++;
          break;
        case SchemaCtxDiffStatus.NEW:
          countNew++;
          break;
        case SchemaCtxDiffStatus.DELETE:
          countDeleted++;
          break;
        case SchemaCtxDiffStatus.UPDATE:
          countUpdated++;
          break;
      }
      for (const colDiff of tableDiff.columns) {
        switch (colDiff.status) {
          case SchemaCtxDiffStatus.UN_CHANGE:
            countUnchanged++;
            break;
          case SchemaCtxDiffStatus.NEW:
            countNew++;

            break;
          case SchemaCtxDiffStatus.DELETE:
            countDeleted++;
            break;
          case SchemaCtxDiffStatus.UPDATE:
            countUpdated++;
            break;
        }
      }
    }
  }

  return {
    countUnchanged,
    countNew,
    countDeleted,
    countUpdated: countUpdated / 2, // divide by 2 to avoid double count of columns and tables
  };
}
