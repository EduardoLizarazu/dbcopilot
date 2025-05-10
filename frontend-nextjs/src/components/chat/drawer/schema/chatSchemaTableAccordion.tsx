"use client";
import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import { ReadTableByConnectionId } from "@/controller/_actions/schema/queries/read-schema-table-by-connection-id";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { Suspense } from "react";

type TChatSchemaTableListProps = {
  connId: number;
};

export function ChatSchemaTableAccordion({
  connId,
}: TChatSchemaTableListProps) {
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
      const response = await ReadTableByConnectionId(Number(connId));
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
          <Accordion key={schemaTableData.table_id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{schemaTableData.table_name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{schemaTableData.table_description}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Suspense>
    </div>
  );
}
