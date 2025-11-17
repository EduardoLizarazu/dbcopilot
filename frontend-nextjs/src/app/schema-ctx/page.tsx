import { ReadAllSchemaCtxAction } from "@/_actions/schemaCtx/read-all.action";
import { SchemaCtxClient } from "./client";

export default async function SchemaCtxPage() {
  const initialData = await ReadAllSchemaCtxAction();
  return <SchemaCtxClient initialRows={initialData.data || []} />;
}
