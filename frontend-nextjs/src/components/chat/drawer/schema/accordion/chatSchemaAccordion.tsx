"use client";
import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import { ReadSchemaTableByConnId } from "@/controller/_actions/schema/queries/read-schema-table-by-connection-id";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { Suspense } from "react";
import { ChatSchemaTableAccordion } from "./chatSchemaTableAccordion";

type TChatSchemaListProps = {
  connId: number;
};

export function ChatSchemaAccordion({ connId }: TChatSchemaListProps) {
  const [schemaTable, setSchemaTable] = React.useState<ISchemaTable[]>([
    {
      table_id: 0,
      table_name: "",
      table_alias: "",
      table_description: "",
    },
  ]);

  // filter by search
  const [search, setSearch] = React.useState<string>("");
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // filter by search
  const filteredSchemaTable = schemaTable.filter((schemaTableData) =>
    schemaTableData.table_name.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    (async () => {
      const response = await ReadSchemaTableByConnId(Number(connId));
      console.log("response chat tables by connection id: ", response);

      setSchemaTable(response);
    })();
  }, []);

  return (
    <div>
      <TextField
        type="text"
        label="Search..."
        value={search}
        onChange={handleSearch}
        variant="outlined"
        fullWidth
        size="small"
        sx={{ marginBottom: 1 }}
      />

      <Suspense fallback={<div>Loading...</div>}>
        {filteredSchemaTable.map((schemaTableData: ISchemaTable) => (
          <ChatSchemaTableAccordion
            key={schemaTableData.table_id}
            schemaTable={schemaTableData}
          />
        ))}
      </Suspense>
    </div>
  );
}
