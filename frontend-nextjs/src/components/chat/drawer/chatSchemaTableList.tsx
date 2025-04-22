"use client";

import { ISchemaTable } from "@/controller/_actions/schema/interface/read-schema-table-column.interface";
import { ReadTableByConnectionId } from "@/controller/_actions/schema/queries/read-table-by-connection-id.query";
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
        label="Search"
        value={""}
        onChange={() => {}}
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
          {schemaTable.map((schemaTableData: ISchemaTable) => (
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
