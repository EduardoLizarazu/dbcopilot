"use client";
import { Box, Button, Container, Menu, MenuItem } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { ChatResultExportBtn } from "./chatResultExportBtn";
import { TCreatePromptCmdWithConnIdOutput } from "@/controller/_actions/chat/command/create-prompt-with-connection-id.command";

/**
 * "data": [
 * {
 * "id": 6,
 * "name": "postgres",
 * "dbName": "naturalquery",
 * "dbHost": "localhost",
 * "dbPort": 5432,
 * "dbUsername": "postgres",
 * "dbPassword": "Passw0rd",
 * "databasetypeId": 1,
 * "description": "dummy description",
 * "is_connected": true
 * },
 * {
 * "id": 7,
 * "name": "mysql_server",
 * "dbName": "another_db",
 * "dbHost": "192.168.1.10",
 * "dbPort": 3306,
 * "dbUsername": "user",
 * "dbPassword": "secret",
 * "databasetypeId": 2,
 * "description": "another description",
 * "is_connected": true
 * }
 * ],
 *
 *
 */
type TChatResultTableProps = {
  data: Omit<TCreatePromptCmdWithConnIdOutput, "final_query">[]; // Adjust the type based on your data structure
};

export function ChatResultTable({ data }: TChatResultTableProps) {
  // Extract columns dynamically from the keys of the first object in the data array
  const columns: GridColDef<any>[] =
    data.length > 0
      ? Object.keys(data[0] as Record<string, unknown>).map((key) => ({
          field: key,
          headerName: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter for header
          width: 150, // You can adjust the default width
          editable: false, // Set to true if you want columns to be editable
        }))
      : [];

  // Use the provided data array directly as the rows
  const rows = data.map((item, index) => ({ id: index, ...item }));

  return (
    <>
      <Container>
        <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
          <ChatResultExportBtn />
        </Container>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </Container>
    </>
  );
}
