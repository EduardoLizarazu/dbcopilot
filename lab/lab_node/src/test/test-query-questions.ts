import { knowledge1 } from "../const/knowledge";
import { testQuestions } from "../const/questionsOnly";
import {
  deleteNamespace,
  queryDenseVector,
  querySparseVector,
  upsertBuilder,
} from "../service/pinecone";

export async function TestUpsertQuestion() {
  try {
    //  Extract
    const withSQL = knowledge1;
    const onlyQuestions = testQuestions.map((q: string) => ({ question: q }));
    console.log(`Testing Upsert of ${onlyQuestions.length} questions...`);

    // Upsert
    await deleteNamespace("test");
    await upsertBuilder(onlyQuestions);
    console.log("Upsert test completed successfully.");
  } catch (error) {
    throw new Error(
      (error as Error).message || "Unknown error in TestUpsertQuestion"
    );
  }
}

export async function TestQueryQuestions(questions?: string) {
  try {
    //  Extract
    const q = questions || "";
    console.log(`Testing Query for questions...`);
    const denseResults = await queryDenseVector(q, 5);
    console.log("Dense Results:", denseResults);

    const sparseResults = await querySparseVector(q, 5);
    console.log("Sparse Results:", sparseResults);
  } catch (error) {
    throw new Error(
      (error as Error).message || "Unknown error in TestQueryQuestions"
    );
  }
}
