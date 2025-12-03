import {
  TestQueryQuestions,
  TestUpsertQuestion,
} from "./test/test-query-questions";

async function main() {
  // await TestUpsertQuestion();
  const question =
    "Muestra todos los pedidos que se encuentran aprobados, incluyendo número de pedido, código de cliente y nombre asociado.";

  console.log("Running main...");
  console.log("Question:", question);
  await TestQueryQuestions(question);
}

main();
