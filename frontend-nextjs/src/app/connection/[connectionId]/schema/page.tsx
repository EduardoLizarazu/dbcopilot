import { Container, Typography } from "@mui/material";
import { Suspense } from "react";
import { SchemaTableHead } from "@/components/schema/schemaTable/schemaTableHead";
import { ReadTableByConnectionId } from "@/controller/_actions/schema/queries/read-table-by-connection-id.query";

export default async function SchemaPage({
  params,
}: {
  params: { connectionId: string };
}) {
  const { connectionId } = await params;

  const schemaTable = await ReadTableByConnectionId(Number(connectionId));
  console.log("SchemaPage schemaTable", schemaTable);

  return (
    <Container>
      <Typography variant="h4">Schema</Typography>
      {/* <SchemaTableList /> */}

      <Suspense fallback={<div>Loading...</div>}>
        <SchemaTableHead schemaTableData={schemaTable} />
      </Suspense>
    </Container>
  );
}
