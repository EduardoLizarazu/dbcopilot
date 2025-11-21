"use server";
import { TNlqQaGoodWithExecutionDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TSchemaCtxDiffSchemaDto } from "@/core/application/dtos/schemaCtx.dto";

type SchemaCtxDiff = TSchemaCtxDiffSchemaDto;
type SelectedNlqGoodDiff = TNlqQaGoodWithExecutionDto;

function buildUsageSets(tablesColumns: string[]) {
  const usedFullIds = new Set<string>(); // schema.table.column
  const usedTableIds = new Set<string>(); // schema.table  o table.column
  const usedColumnNames = new Set<string>(); // solo column

  for (const raw of tablesColumns) {
    // quitar parte de restricción: "public.film_actor.film_id.[> 20]" -> "public.film_actor.film_id"
    const withoutRestriction = raw.split(".[")[0];
    const parts = withoutRestriction.split(".");

    if (parts.length === 3) {
      const [schema, table, column] = parts;
      usedFullIds.add(`${schema}.${table}.${column}`);
      usedTableIds.add(`${schema}.${table}`);
    } else if (parts.length === 2) {
      // puede ser schema.table o table.column, lo tratamos igual
      const [a, b] = parts;
      usedTableIds.add(`${a}.${b}`);
    } else if (parts.length === 1) {
      const [column] = parts;
      usedColumnNames.add(column);
    }
  }

  return { usedFullIds, usedTableIds, usedColumnNames };
}

function filterSchemaCtxDiffBySelected(
  schemaCtxDiff: SchemaCtxDiff[],
  selectedNlqGoodDiff: SelectedNlqGoodDiff
): SchemaCtxDiff[] {
  const { usedFullIds, usedTableIds, usedColumnNames } = buildUsageSets(
    selectedNlqGoodDiff.tablesColumns ?? []
  );

  const filteredSchemas = schemaCtxDiff
    .map((schema) => {
      const filteredTables = (schema.tables ?? [])
        .map((table) => {
          // ¿La tabla está usada explícitamente por id/oldId/newId?
          const tableIdsToCheck = [table.id, table.oldId, table.newId].filter(
            Boolean
          ) as string[];

          const tableUsedById = tableIdsToCheck.some((tid) =>
            usedTableIds.has(tid)
          );

          // Filtramos columnas usadas
          const filteredColumns = (table.columns ?? []).filter((col) => {
            const colIdsToCheck = [col.id, col.oldId, col.newId].filter(
              Boolean
            ) as string[];

            const usedByFullId = colIdsToCheck.some((cid) =>
              usedFullIds.has(cid)
            );

            // match por nombre de columna solamente
            const colNames = colIdsToCheck.map(
              (cid) => cid.split(".").pop() as string
            );
            const usedByColumnName = colNames.some((name) =>
              usedColumnNames.has(name)
            );

            return usedByFullId || usedByColumnName;
          });

          const tableUsed = tableUsedById || filteredColumns.length > 0;

          if (!tableUsed) {
            return null;
          }

          return {
            ...table,
            columns: filteredColumns,
          };
        })
        .filter((t): t is NonNullable<typeof t> => t !== null);

      if (filteredTables.length === 0) {
        return null;
      }

      return {
        ...schema,
        tables: filteredTables,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return filteredSchemas;
}

export async function FindSchemaCtxDiffByNlqGoodAction(
  schemaCtxDiff: SchemaCtxDiff[],
  selectedNlqGoodDiff: SelectedNlqGoodDiff
) {
  const filtered = await filterSchemaCtxDiffBySelected(
    schemaCtxDiff,
    selectedNlqGoodDiff
  );
  return filtered;
}

// Ejemplo de uso:
// const filtered = filterSchemaCtxDiffBySelected(
//   schemaCtxDiff,
//   selectedNlqGoodDiff
// );
// console.log(JSON.stringify(filtered, null, 2));
