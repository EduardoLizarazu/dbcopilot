import { Container, Typography } from "@mui/material";
import { Suspense } from "react";
import { SchemaTableHead } from "@/components/schema/schemaTable/schemaTableHead";
import { ReadTableByConnectionId } from "@/controller/_actions/schema/queries/read-table-by-connection-id.query";
import { CreateSchemaFromConnectionIdCmd } from "@/controller/_actions/schema/commands/create-schema-from-connection-id.command";
import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";

export default async function SchemaPage({
  params,
}: {
  params: { connectionId: string };
}) {
  const { connectionId } = await params;

  let schemaTableAux: ISchemaTable[] | [] = [];

  const schemaTable = await ReadTableByConnectionId(Number(connectionId));
  console.log("SchemaPage schemaTable", schemaTable);

  if (schemaTable.length === 0) {
    // Try to create schema table if it doesn't exist
    const response = await CreateSchemaFromConnectionIdCmd(
      Number(connectionId)
    );
    console.log("SchemaPage response", response);
    if (response.status === 201) {
      console.log("Schema table created successfully");
      schemaTableAux = await ReadTableByConnectionId(Number(connectionId));
    } else {
      console.error("Failed to create schema table", response.status);
    }
  }

  return (
    <Container>
      <Typography variant="h4">Schema</Typography>
      {/* <SchemaTableList /> */}

      <Suspense fallback={<div>Loading...</div>}>
        <SchemaTableHead
          schemaTableData={
            schemaTableAux.length === 0 ? schemaTable : schemaTableAux
          }
        />
      </Suspense>
    </Container>
  );
}
