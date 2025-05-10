"use client";

import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import { ReadTableByConnectionId } from "@/controller/_actions/schema/queries/read-schema-table-by-connection-id";
import { Container, List, ListItemText, TextField } from "@mui/material";
import React, { Suspense } from "react";
import { ChatSchemaTableListItem } from "./chatSchemaTableListItem";

type TChatSchemaTableListProps = {
  connId: number;
};
export function ChatSchemaTableList({ connId }: TChatSchemaTableListProps) {
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
    <>
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
      <List
        component={"nav"}
        aria-label="main mailbox folders"
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          {filteredSchemaTable.map((schemaTableData: ISchemaTable) => (
            <ChatSchemaTableListItem
              key={schemaTableData.table_id}
              schemaTableData={schemaTableData}
            />
          ))}
        </Suspense>
      </List>
    </>
  );
}
