import { Container, Typography } from "@mui/material";
import { SchemaTableList } from "@/components/schema/schemaTableList";

export default async function SchemaPage({ params }: { params: { connectionId: string } }) {
  const { connectionId } = await params;

  console.log("SchemaPage connectionId", connectionId);
  
  return (
    <Container>
      <Typography variant="h4">Schema</Typography>
      <SchemaTableList />
    </Container>
  );
}
