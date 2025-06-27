import { SchemaGraphTable } from "@/components/schemaGraph/schemaGraphTable";
import { ReadAllSchemaGraphAction } from "@/controller/_actions/schema_graph/query/read-all-schema_graph.action";
import { CircularProgress, Container, Typography } from "@mui/material";
import { Suspense } from "react";

type TSchemaGraph = {
  table_neo4j_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
  columns: TSchemaGraphColumn[];
};

type TSchemaGraphColumn = {
  column_type: string;
  column_alias: string;
  column_key_type: string;
  column_name: string;
  column_description: string;
  column_neo4j_id: number;
};

interface Props {
  params: Promise<{
    roleId: string;
  }>;
}

export default async function SchemaGraphPage({ params }: Props) {
  const data: TSchemaGraph[] = await ReadAllSchemaGraphAction();
  const { roleId } = await params;
  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Graph schema of table with columns</Typography>
        <SchemaGraphTable data={data} roleId={roleId} />
      </Container>
    </Suspense>
  );
}
