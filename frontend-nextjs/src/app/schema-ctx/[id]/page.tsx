import { ReadByIdSchemaCtxAction } from "@/_actions/schemaCtx/read-by-id.action";
import { SchemaCtxClient } from "../create/client";
import { NotFound } from "@/components/shared/notFound";
import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import { ReadAllSchemaCtxAction } from "@/_actions/schemaCtx/read-all.action";

export default async function EditSchemaCtxPage({
  params,
}: {
  params: { id: string };
}) {
  const initial = await ReadByIdSchemaCtxAction(await params.id); // my schema ctx
  console.log("READ SCHEMA CTX", initial);

  if (!initial.ok || !initial.data) {
    return <NotFound />;
  }

  const dbConnections = await ReadAllDbConnectionAction(); // all db connections

  const allSchemaCtx = await ReadAllSchemaCtxAction(); // all schema ctxs

  const allSchemaCtxConnIdsExcludingMain =
    allSchemaCtx.data
      ?.flatMap((s) => s?.dbConnectionIds)
      .filter((id) => !initial.data?.dbConnectionIds.includes(id)) || []; // exclude current schema ctx connections

  return (
    <SchemaCtxClient
      initial={initial.data}
      dbConnections={dbConnections.data}
      allSchemaCtxConnIdsExcludingMain={allSchemaCtxConnIdsExcludingMain}
    />
  );
}
