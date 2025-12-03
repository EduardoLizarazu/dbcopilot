import {
  TestQueryQuestions,
  TestUpsertQuestion,
} from "./test/test-query-questions";

async function main() {
  // await TestUpsertQuestion();
  const questions = "Sales breakdown by UM.";

  await TestQueryQuestions(questions);
}

main();
