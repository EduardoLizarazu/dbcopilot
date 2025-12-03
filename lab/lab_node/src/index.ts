import { TestFineTuneOpenAi } from "./fine-tuning/fine-tuning";
import {
  TestQueryQuestions,
  TestUpsertQuestion,
} from "./test/test-query-questions";

async function main() {
  await TestUpsertQuestion();
  // await TestQueryQuestions();
}

main();
