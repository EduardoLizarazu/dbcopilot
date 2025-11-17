import { ReadByIdSchemaCtxAction } from "@/_actions/schemaCtx/read-by-id.action";
import { SchemaCtxClient } from "../create/client";
import { NotFound } from "@/components/shared/notFound";

export default async function EditSchemaCtxPage({
  params,
}: {
  params: { id: string };
}) {
  const initial = await ReadByIdSchemaCtxAction(await params.id);

  if (!initial.ok || !initial.data) {
    return <NotFound />;
  }

  return <SchemaCtxClient initial={initial.data} />;
}
