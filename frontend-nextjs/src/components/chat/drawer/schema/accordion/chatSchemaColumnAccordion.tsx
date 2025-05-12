"use client";
import { SchemaColumnQueryFormat } from "@/controller/_actions/schema/interface/readColumnByTableId.interface";
import { Container, Divider, Typography } from "@mui/material";

interface IChatSchemaColumnAccordionProps {
  schemaColumn: SchemaColumnQueryFormat;
}

export function ChatSchemaColumnAccordion({
  schemaColumn,
}: IChatSchemaColumnAccordionProps) {
  return (
    <Container>
      <Typography variant="body2">
        {schemaColumn.column_technical_name}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        {schemaColumn.column_description || "..."}
      </Typography>
      <Divider />
    </Container>
  );
}
