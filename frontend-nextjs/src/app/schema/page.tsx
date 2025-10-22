import { ReadAllSchemaAction } from "@/_actions/schema/read-all.action";
import ListSchemaClient from "./client";

export default async function SchemaPage() {
  const initial = await ReadAllSchemaAction();
  return <ListSchemaClient initialRows={initial.data} />;
}
