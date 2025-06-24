"use client";
import { useFeedbackContext } from "@/contexts/feedback.context";
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
import { TableBodyRole } from "./tableBodyRole";

interface Props {
  fetchedData: { name: string; id: number; description?: string }[];
}

export function TableHeadRole({ fetchedData }: Props) {
  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [data, setData] = React.useState<
    { name: string; id: number; description?: string }[]
  >([]);
  const filteredData = data.filter((row) =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    // Fetch or set initial data here
    setData(fetchedData);
    console.log("fetchedData role", fetchedData);
  }, []);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search Role"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ margin: 2, width: "300px" }}
        />
        <Link href="/auth/roles/create">
          <Button variant="contained" color="primary">
            Create
          </Button>
        </Link>
      </Stack>

      <TableContainer component={Paper} className="my-4">
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
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
                  <TableBodyRole key={item.id} fetchedData={item} />
                ))
              )}
            </Suspense>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
