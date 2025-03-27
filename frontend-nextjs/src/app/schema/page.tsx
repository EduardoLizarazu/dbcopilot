"use client";
import { Container, Typography } from "@mui/material";
import SchemaDataGrid from "@/components/schemaDataGrid";
import { SchemaTableList } from "@/components/schemaTableList";

export default function SchemaPage() {
  return (
    <Container>
      <Typography variant="h4">Schema</Typography>
      <SchemaDataGrid />
      <SchemaTableList />
    </Container>
  );
}
