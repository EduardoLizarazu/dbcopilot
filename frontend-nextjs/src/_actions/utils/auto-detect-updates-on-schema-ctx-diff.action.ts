"use server";
import {
  SchemaCtxDiffStatus,
  TSchemaCtxDiffSchemaDto,
} from "@/core/application/dtos/schemaCtx.dto";
import { jaroWinklerScore } from "./similarity-score-jaro-winkler.action";

const THRESHOLD = 0.7;

interface AutoProcessResult {
  schemaDeepCopy: TSchemaCtxDiffSchemaDto[];
  logs: string[];
}

export async function AutoDetectSchemaUpdatesOnSchemaCtxDiffAction(
  schemas: TSchemaCtxDiffSchemaDto[]
): Promise<AutoProcessResult> {
  const logs: string[] = [];

  // --- HELPER: Función genérica de Matching ---
  // T: Tipo del elemento (Schema, Table, Column)
  // ContextFn: Función para procesar hijos si hay match (Callback)
  function findAndLinkMatches<
    T extends {
      id?: string;
      name?: string;
      status?: SchemaCtxDiffStatus;
      oldId?: string;
      oldName?: string;
      newId?: string;
      newName?: string;
      matchScore?: string;
    }
  >(
    items: T[],
    typeLabel: string, // Para el log (ej: "Tabla", "Columna")
    processChildren?: (newItem: T, oldItem: T) => void
  ) {
    if (!items || items.length === 0) return;

    // Filtramos candidatos
    const newItems = items.filter((x) => x.status === SchemaCtxDiffStatus.NEW);
    const delItems = items.filter(
      (x) => x.status === SchemaCtxDiffStatus.DELETE
    );

    newItems.forEach((newItem) => {
      let bestMatch: T | null = null;
      let highestScore = 0;

      // Buscamos el mejor candidato entre los eliminados
      for (const delItem of delItems) {
        // Si ya fue emparejado por otra iteración, lo saltamos
        if (delItem.status === SchemaCtxDiffStatus.UPDATE) continue;

        const score = jaroWinklerScore(newItem.name || "", delItem.name || "");

        if (score > highestScore) {
          highestScore = score;
          bestMatch = delItem;
        }
      }

      // Si superamos el umbral
      if (bestMatch && highestScore >= THRESHOLD) {
        const percentage = (highestScore * 100).toFixed(2) + "%";

        // 1. Log
        logs.push(
          `[${typeLabel}] MATCH ${percentage}: '${bestMatch.name}' (DELETE) -> '${newItem.name}' (NEW)`
        );

        // 2. Actualizar estados a UPDATE
        newItem.status = SchemaCtxDiffStatus.UPDATE;
        newItem.oldId = bestMatch.id || "";
        newItem.oldName = bestMatch.name || "";
        newItem.matchScore = percentage;

        bestMatch.status = SchemaCtxDiffStatus.UPDATE;
        bestMatch.newId = newItem.id || "";
        bestMatch.newName = newItem.name || "";
        bestMatch.matchScore = percentage;

        // 3. Procesar Hijos (Jerarquía)
        // Aquí ocurre la magia: Si encontramos que TableA es TableB,
        // forzamos la comparación de sus columnas inmediatamente.
        if (processChildren) {
          processChildren(newItem, bestMatch);
        }
      }
    });
  }

  // --- PROCESADORES POR NIVEL ---

  // Nivel 3: Columnas
  function processColumns(newCols: any[], oldCols: any[]) {
    // Unimos listas para que el matcher las filtre
    const combinedCols = [...(newCols || []), ...(oldCols || [])];

    findAndLinkMatches(combinedCols, "Columna", (newCol, oldCol) => {
      // Si la columna hizo match, actualizamos también su DataType
      if (newCol.dataType && oldCol.dataType) {
        newCol.dataType.status = SchemaCtxDiffStatus.UPDATE;
        newCol.dataType.oldId = oldCol.dataType.id; // O oldCol.dataType.oldId dependiendo de tu estructura de origen
        newCol.dataType.oldName = oldCol.dataType.name;

        oldCol.dataType.status = SchemaCtxDiffStatus.UPDATE;
        oldCol.dataType.newId = newCol.dataType.id;
        oldCol.dataType.newName = newCol.dataType.name;
      }
    });
  }

  // Nivel 2: Tablas
  function processTables(newTables: any[], oldTables: any[]) {
    const combinedTables = [...(newTables || []), ...(oldTables || [])];

    findAndLinkMatches(combinedTables, "Tabla", (newTable, oldTable) => {
      // Callback: Se ejecuta cuando encontramos que una tabla es un UPDATE.
      // Cruzamos las columnas de la tabla nueva (NEW) con las de la vieja (DELETE).
      // Al ser la misma tabla, las columnas que se llamen igual tendrán score 1.0 (100%)
      processColumns(newTable.columns, oldTable.columns);
    });

    // IMPORTANTE: También procesar columnas de tablas que NO cambiaron (UN_CHANGE).
    // Puede que la tabla sea la misma, pero le cambiaron el nombre a una columna.
    const unchangedTables = combinedTables.filter(
      (t) => t.status === SchemaCtxDiffStatus.UN_CHANGE
    );
    unchangedTables.forEach((table) => {
      if (table.columns) {
        // Pasamos las mismas columnas como "nuevas" y "viejas" porque están en la misma lista
        // El 'findAndLinkMatches' sabrá separar NEW de DELETE internamente.
        processColumns(table.columns, []); // El segundo param puede ir vacio si pasamos todo en el primero,
        // pero por consistencia con mi lógica de arriba,
        // 'processColumns' espera listas separadas o combinadas.
        // Modificaré processColumns ligeramente para aceptar un solo array arriba.
        processColumns(table.columns, []);
      }
    });
  }

  // Nivel 1: Esquemas (Root)
  findAndLinkMatches(schemas, "Esquema", (newSchema, oldSchema) => {
    // Callback: Si el esquema fue renombrado (UPDATE)
    processTables(newSchema.tables, oldSchema.tables);
  });

  // Procesar tablas de esquemas que no cambiaron
  const unchangedSchemas = schemas.filter(
    (s) => s.status === SchemaCtxDiffStatus.UN_CHANGE
  );
  unchangedSchemas.forEach((schema) => {
    // Buscamos updates de tablas dentro del mismo esquema
    // Aquí 'schema.tables' contiene NEWs y DELETEs mezclados
    processTables(schema.tables, []);
  });

  const schemaDeepCopy: typeof schemas = JSON.parse(JSON.stringify(schemas));

  return { schemaDeepCopy, logs };
}
