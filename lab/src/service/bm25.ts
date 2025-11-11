import bm25 from "wink-bm25-text-search";
import tokenizer from "wink-tokenizer";

const tok = tokenizer();
const engine = bm25();

// Define cómo tokenizar
engine.defineConfig({ fldWeights: { content: 1 } });
engine.definePrepTasks([
  (text) =>
    tok
      .tokenize(text)
      .filter((t) => t.tag === "word")
      .map((t) => t.value.toLowerCase()),
]);

// Documentos base
const docs = [
  { id: "doc1", content: "Azúcar refinada blanca sin azufre" },
  { id: "doc2", content: "Alcohol etílico 96 grados" },
  { id: "doc3", content: "Azúcar morena granulada" },
];

// Agrega documentos
docs.forEach((doc) => engine.addDoc(doc, doc.id));
engine.consolidate(); // Prepara el índice

// Consulta
const query = "azúcar blanca";
const results = engine.search(query);

// Muestra resultados con score BM25
console.log(results);
