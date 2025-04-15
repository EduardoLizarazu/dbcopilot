"use client";
import {
  ReadConnectionAction,
  ReadConnectionOutput,
} from "@/controller/_actions/index.actions";
import {
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Suspense } from "react";
import { ConnTableBody } from "./connTableBody";
import React from "react";

export function ConnTableHead({
  connData,
}: {
  connData: ReadConnectionOutput[];
}) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [data, setData] = React.useState<ReadConnectionOutput[]>([]);
  const filteredData = data.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    setData(connData);
  }, []);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search Connection"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ margin: 2, width: "300px" }}
        />
        <Link href="/connection/create">
          <Button variant="contained" color="primary">
            Create
          </Button>
        </Link>
      </Stack>

      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Connection Name</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">Type</TableCell>
              <TableCell align="center">Database Name</TableCell>
              <TableCell align="center">Host</TableCell>
              <TableCell align="center">Port</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <Suspense
              fallback={
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              }
            >
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <ConnTableBody key={item.id} conn={item} />
                ))
              )}
            </Suspense>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
