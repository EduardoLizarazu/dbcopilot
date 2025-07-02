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
import { HistoryTableBody } from "./historyTableBody";

type TReadHistoryPrompt = {
  prompt_id: number;
  prompt: string;
  is_user_deletion: boolean; // Assuming this is a boolean flag
  sql_query: string;
  message_error: string | null;
  id_user: string;
  hf_id: number | null;
  is_like: boolean | null;
  message: string | null;
  user_name: string;
  username: string;
};

interface Props {
  fetchedData: TReadHistoryPrompt[];
}

export function HistoryTableHead({ fetchedData }: Props) {
  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [data, setData] = React.useState<TReadHistoryPrompt[]>([]);
  const filteredData = data.filter((row) =>
    row.prompt.toLowerCase().includes(searchTerm.toLowerCase())
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
              <TableCell align="center">Prompt</TableCell>
              <TableCell align="center">Description</TableCell>
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
                  <HistoryTableBody key={item.prompt_id} fetchedData={item} />
                ))
              )}
            </Suspense>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
