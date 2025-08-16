import { Pool } from "pg";
export const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export async function getPhysicalSchema() {
  // pull table & column names (restrict to your sales schema if needed)
  const q = `
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog','information_schema')
    ORDER BY table_schema, table_name, ordinal_position;
  `;
  const { rows } = await pool.query(q);
  // compact string for prompt
  const byTable = new Map<string, { cols: string[] }>();
  for (const r of rows) {
    const key = `${r.table_schema}.${r.table_name}`;
    if (!byTable.has(key)) byTable.set(key, { cols: [] });
    byTable.get(key)!.cols.push(`${r.column_name} ${r.data_type}`);
  }
  const summary = [...byTable.entries()]
    .map(([t, { cols }]) => `- ${t}(\n  ${cols.join(", ")}\n)`)
    .join("\n");
  return summary;
}
