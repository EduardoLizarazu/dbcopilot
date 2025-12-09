function jaroDistance(s1: string, s2: string): number {
  const m = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - m);
    const end = Math.min(i + m + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  return (
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3
  );
}

export function jaroWinklerScore(s1: string, s2: string): number {
  const jaro = jaroDistance(s1, s2);
  let prefix = 0;
  for (let i = 0; i < Math.min(4, s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

export function TestSimilarityScoreWinkler() {
  const score1 = jaroWinklerScore("pb7_cliente", "pb7_clientes");
  console.log(
    "P:",
    Math.round(score1 * 100) + "%",
    "pb7_cliente <-> pb7_clientes"
  );
  // → Probabilidad: 98%

  const score2 = jaroWinklerScore("pb7_itempv", "pb7_item");
  console.log("P:", Math.round(score2 * 100) + "%", "pb7_itempv <-> pb7_item");
  // → Probabilidad: 96%

  const score3 = jaroWinklerScore("sc6300", "sc6301");
  console.log("P:", Math.round(score3 * 100) + "%", "sc6300 <-> sc6301");
  // → Probabilidad: 93%

  const score4 = jaroWinklerScore("pb7_cliente", "pb7_cod_cliente");
  console.log(
    "P:",
    Math.round(score4 * 100) + "%",
    "pb7_cliente <-> pb7_cod_cliente"
  );
  // → Probabilidad: 95%

  const score5 = jaroWinklerScore("d2_doc", "d2_numero_doc");
  console.log("P:", Math.round(score5 * 100) + "%", "d2_doc <-> d2_numero_doc");
  // → Probabilidad: 76%

  const score6 = jaroWinklerScore("b1_cod", "b1_cod_change");
  console.log("P:", Math.round(score6 * 100) + "%", "b1_cod <-> b1_cod_change");
  // → Probabilidad: 89%

  const score7 = jaroWinklerScore("c6_id", "c6_id_change");
  console.log("P:", Math.round(score7 * 100) + "%", "c6_id <-> c6_id_change");
  // → Probabilidad: 88%
}
