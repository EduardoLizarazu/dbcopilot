import { schemaCtx } from "../const/schemaCtx";
import { schemaCtxDiff } from "../const/schemaCtxDiff";
import { checkMerge, printTestResults } from "../utils/check-merge";
import { FromSchemaDiffToSchemaCtxAction } from "../utils/merge-schema-ctx-diff-to-schema-ctx";

export function TestMergeSchemaCtxWithSchemaCtxDiff() {
  const schemaCtxMerged = FromSchemaDiffToSchemaCtxAction({
    oldSchemaCtx: schemaCtx,
    schemasCtxDiff: schemaCtxDiff,
  });

  const checkMergeResult = checkMerge(schemaCtxMerged);
  printTestResults(checkMergeResult);
}
