"use client";
import { Container, Typography } from "@mui/material";
import { SchemaTableList } from "@/components/schema/schemaTableList";

export default function SchemaPage() {
  return (
    <Container>
      <Typography variant="h4">Schema</Typography>
      <SchemaTableList />
    </Container>
  );
}
