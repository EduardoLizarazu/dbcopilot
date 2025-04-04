import React, { Suspense } from "react";
import { Button, CircularProgress, Container, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { ReadConnectionAction, ReadConnectionOutput } from "@/controller/_actions/index.actions";
import { ConnectionTable } from "@/components/connection/connectionTable";


export default function ConnectionPage() {

  const connList = ReadConnectionAction()

  return (
    <Suspense fallback={<CircularProgress />}>
      <Container>
        <Typography variant="h4">Connections</Typography>
        <Link href="/connection/create">
          <Button variant="contained" color="primary">
            Create
          </Button>
        </Link>
        <TableContainer component={Paper} className="my-4">
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Connection Name</TableCell>
                <TableCell align="left">Description</TableCell>
                <TableCell align="left">Type</TableCell>
                <TableCell align="left">Database Name</TableCell>
                <TableCell align="left">Host</TableCell>
                <TableCell align="left">Action</TableCell>
              </TableRow>
            </TableHead>
              <Suspense fallback={<TableBody>
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                </TableBody>}>
                <ConnectionTable connList={connList} />
              </Suspense>
          </Table>
        </TableContainer>
      </Container>
  </Suspense>
  );
}
