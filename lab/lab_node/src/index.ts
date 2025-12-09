import { TestMergeSchemaCtxWithSchemaCtxDiff } from "./test/testMergeSchemaCtxWithSchemaCtxDiff";
import { TestSimilarityScoreWinkler } from "./utils/similarityScoreJaroWinkler";
import { TestSimilarityScoreLevenshtein } from "./utils/similarityScoreLevenshtein";

export function Main() {
  // TestMergeSchemaCtxWithSchemaCtxDiff();
  // TestSimilarityScoreLevenshtein();
  TestSimilarityScoreWinkler();
}

Main();
