"use client";
import { ISchemaTable } from "@/controller/_actions/index.actions";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import React, { Suspense } from "react";
import { SchemaTableBody } from "./schemaTableBody";
export function SchemaTableHead({
  schemaTableData,
}: {
  schemaTableData: ISchemaTable[];
}) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [schemaTable, setSchemaTable] = React.useState<ISchemaTable[]>([
    {
      table_id: 0,
      table_name: "",
      table_alias: "",
      table_description: "",
    },
  ]);
  const filteredSchemaTable = schemaTable.filter((row) =>
    row.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    (async () => {
      const data = await schemaTableData;
      setSchemaTable(data);
    })();
  }, []);

  return (
    <Box>
      <TextField
        label="Search Tables"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Table Name</TableCell>
              <TableCell>Table Alias</TableCell>
              <TableCell>Table Description</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <Suspense
              fallback={
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              }
            >
              {filteredSchemaTable?.map((row) => (
                // TABLES -> COLUMNS
                <SchemaTableBody key={row.table_id} schemaTableData={row} />
              ))}
            </Suspense>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
