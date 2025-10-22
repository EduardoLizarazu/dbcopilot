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
  Tooltip,
  IconButton,
  Link,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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

  async function onDelete(id: string) {
    throw new Error("Function not implemented.");
  }

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
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
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
                const connFields = row.connStringRef.flatMap((conn) => [
                  {
                    type: conn.type,
                    host: conn.host,
                    port: conn.port,
                    database: conn.database,
                  },
                ]);
                return connFields.map((field, index) => (
                  <TableRow key={`${row.id}-${index}`}>
                    <TableCell>{field.type}</TableCell>
                    <TableCell>{field.host}</TableCell>
                    <TableCell>{field.port}</TableCell>
                    <TableCell>{field.database}</TableCell>
                    <TableCell>{connectionCount}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          component={Link}
                          href={`/schema/${row.id}`}
                          aria-label="Edit role"
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                          onClick={() => onDelete(row.id)}
                          aria-label="Remove role"
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
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
