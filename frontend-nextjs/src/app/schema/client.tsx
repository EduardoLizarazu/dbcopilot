"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import { TSchemaOutRqDto } from "@/core/application/dtos/schemaContext.dto";

export default function ListSchemaClient({
  initialRows,
}: {
  initialRows: TSchemaOutRqDto[];
}) {
  const [rows, setRows] = React.useState<TSchemaOutRqDto[]>(initialRows);
  const [query, setQuery] = React.useState("");

  // Filter rows based on the query
  const filteredRows = rows.filter((row) => {
    const lowerQuery = query.toLowerCase();
    return row.connStringRef.some((conn) =>
      [
        conn.type.toLowerCase(),
        conn.host.toLowerCase(),
        conn.port.toString(),
        conn.database.toLowerCase(),
      ].some((field) => field.includes(lowerQuery))
    );
  });

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Schema List
      </Typography>

      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by dbtype, host, port, or dbname..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
      </Paper>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small" aria-label="schema table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>DB Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Host</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Port</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DB Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Connections</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const connectionCount = row.connStringRef.length;
                return row.connStringRef.map((conn, index) => (
                  <TableRow key={`${row.id}-${index}`}>
                    <TableCell>{conn.type}</TableCell>
                    <TableCell>{conn.host}</TableCell>
                    <TableCell>{conn.port}</TableCell>
                    <TableCell>{conn.database}</TableCell>
                    <TableCell>{connectionCount}</TableCell>
                  </TableRow>
                ));
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
