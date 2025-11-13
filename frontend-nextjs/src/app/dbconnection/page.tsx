import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import DbConnectionClient from "./client";
export default async function DbConnectionPage() {
  const initial = await ReadAllDbConnectionAction();
  return <DbConnectionClient initialData={initial.data} />;
}
