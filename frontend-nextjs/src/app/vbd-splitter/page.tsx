import VbdIndexClient from "./client";

export default async function VbdIndexPage() {
  //   const initial = await ReadAllVbdIndexAction();
  const initial = { data: [] };
  return <VbdIndexClient initialRows={initial.data} />;
}
