import { TestMergeSchemaCtxWithSchemaCtxDiff } from "./test/testMergeSchemaCtxWithSchemaCtxDiff";
import { TestAutoDetectUpdatesOnSchemaCtxDiff } from "./utils/autoDetectUpdatesOnSchemaCtxDiff";
import { TestSimilarityScoreWinkler } from "./utils/similarityScoreJaroWinkler";
import { TestSimilarityScoreLevenshtein } from "./utils/similarityScoreLevenshtein";

export function Main() {
  // TestMergeSchemaCtxWithSchemaCtxDiff();
  // TestSimilarityScoreLevenshtein();
  // TestSimilarityScoreWinkler();
  TestAutoDetectUpdatesOnSchemaCtxDiff();
}

Main();
