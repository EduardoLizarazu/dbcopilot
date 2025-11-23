import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import { SchemaCtxClient } from "./client";
import { ReadAllSchemaCtxAction } from "@/_actions/schemaCtx/read-all.action";

export default async function CreateSchemaCtxPage() {
  const dbConnections = await ReadAllDbConnectionAction();

  const allSchemaCtx = await ReadAllSchemaCtxAction();
  const allSchemaCtxConnIds =
    allSchemaCtx.data?.flatMap((s) => s?.dbConnectionIds) || [];

  return (
    <SchemaCtxClient
      dbConnections={dbConnections.data}
      allSchemaCtxConnIdsExcludingMain={allSchemaCtxConnIds}
    />
  );
}
