import { ReadByIdSchemaCtxAction } from "@/_actions/schemaCtx/read-by-id.action";
import { SchemaCtxClient } from "../create/client";
import { NotFound } from "@/components/shared/notFound";
import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";

export default async function EditSchemaCtxPage({
  params,
}: {
  params: { id: string };
}) {
  const initial = await ReadByIdSchemaCtxAction(await params.id);
  console.log("READ SCHEMA CTX", initial);

  if (!initial.ok || !initial.data) {
    return <NotFound />;
  }

  const dbConnections = await ReadAllDbConnectionAction();

  return (
    <SchemaCtxClient
      initial={initial.data}
      dbConnections={dbConnections.data}
    />
  );
}
