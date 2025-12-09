import { SchemaCtxDiffStatus, TSchemaCtxDiff } from "../types/schemaCtxDiff";

export function autoDetectUpdates(schemas: TSchemaCtxDiff[], threshold = 0.8) {
  for (const schema of schemas) {
    if (!schema.tables) continue;

    for (const table of schema.tables) {
      if (!table.columns) continue;

      const news = table.columns.filter(
        (c) => c.status === SchemaCtxDiffStatus.NEW
      );
      const deletes = table.columns.filter(
        (c) => c.status === SchemaCtxDiffStatus.DELETE
      );

      for (const n of news) {
        let bestMatch: { col: typeof n; score: number } | null = null;

        for (const d of deletes) {
          const score = similarityScore(n.name ?? "", d.name ?? "");
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { col: d, score };
          }
        }

        if (bestMatch && bestMatch.score >= threshold) {
          // Marcar ambos como UPDATE
          n.status = SchemaCtxDiffStatus.UPDATE;
          n.oldId = bestMatch.col.id;
          n.oldName = bestMatch.col.name;
          n.newId = "";
          n.newName = "";

          bestMatch.col.status = SchemaCtxDiffStatus.UPDATE;
          bestMatch.col.newId = n.id;
          bestMatch.col.newName = n.name;
          bestMatch.col.oldId = "";
          bestMatch.col.oldName = "";

          // Guardar probabilidad
          (n as any).probability = Math.round(bestMatch.score * 100);
          (bestMatch.col as any).probability = Math.round(
            bestMatch.score * 100
          );
        }
      }
    }
  }
}
