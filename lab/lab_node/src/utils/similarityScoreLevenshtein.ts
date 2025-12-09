function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // matriz de distancias
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1][j] + 1, // eliminación
        dp[i]![j - 1] + 1, // inserción
        dp[i - 1][j - 1] + cost // sustitución
      );
    }
  }

  return dp[m][n];
}

export function similarityScore(a: string, b: string): number {
  if (!a || !b) return 0;
  a = a.toLowerCase().trim();
  b = b.toLowerCase().trim();

  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen; // valor entre 0 y 1
}

export function TestSimilarityScoreLevenshtein() {
  const score1 = similarityScore("pb7_cliente", "pb7_clientes");
  console.log(
    "P:",
    Math.round(score1 * 100) + "%",
    "pb7_cliente <-> pb7_clientes"
  );
  // → Probabilidad: 92%

  const score2 = similarityScore("pb7_itempv", "pb7_item");
  console.log("P:", Math.round(score2 * 100) + "%", "pb7_itempv <-> pb7_item");
  // → Probabilidad: 80%

  const score3 = similarityScore("sc6300", "sc6301");
  console.log("P:", Math.round(score3 * 100) + "%", "sc6300 <-> sc6301");
  // → Probabilidad: 92%

  const score4 = similarityScore("pb7_cliente", "pb7_cod_cliente");
  console.log(
    "P:",
    Math.round(score4 * 100) + "%",
    "pb7_cliente <-> pb7_cod_cliente"
  );
  // → Probabilidad: 73%

  const score5 = similarityScore("d2_doc", "d2_numero_doc");
  console.log("P:", Math.round(score5 * 100) + "%", "d2_doc <-> d2_numero_doc");
  // → Probabilidad: 46%

  const score6 = similarityScore("b1_cod", "b1_cod_change");
  console.log("P:", Math.round(score6 * 100) + "%", "b1_cod <-> b1_cod_change");
  // → Probabilidad: 46%

  const score7 = similarityScore("c6_id", "c6_id_change");
  console.log("P:", Math.round(score7 * 100) + "%", "c6_id <-> c6_id_change");
  // → Probabilidad: 42%
}
