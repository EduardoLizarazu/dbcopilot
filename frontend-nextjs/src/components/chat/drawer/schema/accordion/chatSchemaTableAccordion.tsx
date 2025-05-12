"use client";

import React from "react";
import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Suspense } from "react";
import { ReadColumnByTableId } from "@/controller/_actions/schema/queries/read-column-by-table-id.query";
import { SchemaColumnQueryFormat } from "@/controller/_actions/schema/interface/readColumnByTableId.interface";
import { ChatSchemaColumnAccordion } from "./chatSchemaColumnAccordion";

type TChatSchemaTableAccordionProps = {
  schemaTable: ISchemaTable;
};

export function ChatSchemaTableAccordion({
  schemaTable,
}: TChatSchemaTableAccordionProps) {
  const [expanded, setExpanded] = React.useState(false);

  const [schemaColumn, setSchemaColumn] = React.useState<
    SchemaColumnQueryFormat[]
  >([
    {
      column_id: 0,
      column_technical_name: "",
      column_alias: null,
      column_description: "",
      column_data_type: "",
      is_primary_key: null,
      is_foreign_key: null,
      is_unique: null,
      relation_foreign_key_id: null,
      relation_primary_key_id: null,
      relation_is_static: null,
      is_primary_key_static: null, // this id is to the other column
      is_foreign_key_static: null,
    },
  ]);

  const toggleAccordion = () => {
    setExpanded((prev) => !prev);
    console.log("Accordion toggled", schemaTable.table_id);
    (async () => {
      await readSchemaColumnByTableId(schemaTable.table_id);
      console.log("Schema column data", schemaColumn);
    })();
  };

  async function readSchemaColumnByTableId(tableId: number) {
    try {
      const response = await ReadColumnByTableId(tableId);
      setSchemaColumn(response);
      console.log("Read schema column by table id", tableId);
    } catch (error) {
      console.error("Error fetching schema columns:", error);
    }
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Accordion
          key={schemaTable.table_id}
          expanded={expanded}
          onChange={toggleAccordion}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{schemaTable.table_name}</Typography>
            <Typography component="span" sx={{ color: "text.secondary" }}>
              {schemaTable.table_alias}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              {schemaTable.table_description}
            </Typography>
            <Suspense fallback={<div>Loading...</div>}>
              {schemaColumn.map((schemaColumnData) => (
                <ChatSchemaColumnAccordion
                  key={schemaColumnData.column_id}
                  schemaColumn={schemaColumnData}
                />
              ))}
            </Suspense>
          </AccordionDetails>
        </Accordion>
      </Suspense>
    </>
  );
}
