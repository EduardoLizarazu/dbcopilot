import React, { Suspense } from "react";
import {
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  ReadConnectionAction,
  ReadConnectionOutput,
} from "@/controller/_actions/index.actions";
import { ConnTableBody } from "@/components/connection/connTableBody";

export default function ConnectionPage() {
  const connList = ReadConnectionAction();

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
                <TableCell align="center">Connection Name</TableCell>
                <TableCell align="center">Description</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Database Name</TableCell>
                <TableCell align="center">Host</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <Suspense
              fallback={
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                </TableBody>
              }
            >
              <ConnTableBody connList={connList} />
            </Suspense>
          </Table>
        </TableContainer>
      </Container>
    </Suspense>
  );
}
