"use client";

import { ReadSqlSchemaActionOutput } from "@/controller/_actions/sqlschema/interface/sqlschema_create.interface";
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
import React, { Suspense } from "react";
import { SqlSchemaTableBody } from "./sqlschema_table_body";

export function SqlSchemaTableHead({
  sqlSchemaData,
}: {
  sqlSchemaData: ReadSqlSchemaActionOutput[];
}) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [data, setData] = React.useState<ReadSqlSchemaActionOutput[]>([]);
  const filteredData = data.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    setData(sqlSchemaData);
    console.log("sqlSchemaData", sqlSchemaData);
  }, []);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search sql schema"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ margin: 2, width: "300px" }}
        />
        <Link href="/sqlschema/create">
          <Button variant="contained" color="primary">
            Create
          </Button>
        </Link>
      </Stack>

      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">Description</TableCell>
              <TableCell align="center">SQL Query</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            <Suspense
              fallback={
                <TableRow>
                  <TableCell colSpan={4} align="center">
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
                  <SqlSchemaTableBody key={item.id} sqlSchema={item} />
                ))
              )}
            </Suspense>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
