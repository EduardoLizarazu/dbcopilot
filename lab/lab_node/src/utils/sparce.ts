// utils/sparse.ts
export type SparseVector = { indices: number[]; values: number[] };

/**
 * Implementá esto con tu pipeline BM25 o SPLADE:
 * - Debe tokenizar y mapear tokens -> ids consistentes.
 * - Debe devolver pesos (BM25 o SPLADE) en 'values'.
 */
export function buildSparseVector(text: string): SparseVector {
  // TODO: reemplazar por tu implementación real
  // Ejemplo didáctico (NO producción): pondera tokens duros con 1.0
  const hardTokens = ["C9_STATUS", "SC9300", "C9_PEDIDO", "aprobado"];
  const indices = hardTokens.map((_, i) => i); // <-- en producción: ids reales del tokenizer
  const values = hardTokens.map(() => 1.0); // <-- en producción: pesos BM25/SPLADE
  return { indices, values };
}
