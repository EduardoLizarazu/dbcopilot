import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import { SchemaCtxClient } from "./client";

export default async function CreateSchemaCtxPage() {
  const dbConnections = await ReadAllDbConnectionAction();
  return <SchemaCtxClient dbConnections={dbConnections.data} />;
}
