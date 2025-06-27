import { SchemaGraphTable } from "@/components/schemaGraph/schemaGraphTable";
import { ReadAllSchemaGraphByRoleIdAction } from "@/controller/_actions/schema_graph/query/read-all-schema_graph-by-role-id.action";
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

type TSchemaGraphDb = {
  role_id: number;
  column_id: number;
  table_id: number;
};

export default async function SchemaGraphPage({ params }: Props) {
  const data: TSchemaGraph[] = await ReadAllSchemaGraphAction();
  const { roleId } = await params;
  const dataRole: TSchemaGraphDb[] = await ReadAllSchemaGraphByRoleIdAction(
    parseInt(roleId)
  );
  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Graph schema of table with columns</Typography>
        <SchemaGraphTable data={data} dataRole={dataRole} />
      </Container>
    </Suspense>
  );
}
