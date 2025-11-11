import { schemaBased } from "../const/schema";
import { PromptBuilder } from "../prompt";
import { saveAsFile } from "../service/file";
import { queryGeneration } from "../service/openai";
import { queryByQuestion } from "../service/pinecone";

const question = `

Mostrame las líneas de pedido aprobadas emitidas entre el 01/01/25 y el 16/02/25, indicando pedido, cliente (id y nombre), producto (id y descripción), cantidad pedida y fecha de emisión.
`;
export async function Test1() {
  const similarKnowledgeBased = await queryByQuestion(question, 10);
  console.log("SIMILAR: ", similarKnowledgeBased);

  const constant = {
    dbType: "oracle19c",
    question: question,
    similarKnowledgeBased: similarKnowledgeBased,
    schemaBased: schemaBased,
  };
  const prompt = PromptBuilder(constant);
  // console.log("PROMPT: ", prompt);
  const response = await queryGeneration(prompt);
  console.log("RESPONSE", response);
  saveAsFile({ prompt, response: response.answer });
}
