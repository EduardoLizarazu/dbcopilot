import {
  TestQueryQuestions,
  TestUpsertQuestion,
} from "./test/test-query-questions";

async function main() {
  // await TestUpsertQuestion();
  const question = `
  Filtrame aquellos pedidos asociados al azúcar que sigan figurando como pendientes aunque tengan estados contradictorios en el sistema (activo/inactivo, aprobado/reprobado, cancelado/no cancelado) y que además continúan sin chofer asignado.
  `;

  console.log("Running main...");
  console.log("Question:", question);
  await TestQueryQuestions(question);
}

main();
