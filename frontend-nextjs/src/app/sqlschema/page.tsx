import { SqlSchemaTableHead } from "@/components/sqlschema/sqlschema_table_head";
import { ReadAllSqlSchemaAction } from "@/controller/_actions/index.actions";
import { Container, Typography } from "@mui/material";
export default async function Page() {
  const data = await ReadAllSqlSchemaAction();
  return (
    <Container>
      <Typography variant="h4">Sql Connection extract schema</Typography>
      <SqlSchemaTableHead sqlSchemaData={data} />
    </Container>
  );
}
