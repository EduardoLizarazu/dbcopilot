"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  listNlqCorrectionsAction,
  type NlqHistoryItem,
} from "@/controller/_actions/nlq/list-correction";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";

export default function NlqCorrectionsClient({
  initialRows,
}: {
  initialRows: NlqHistoryItem[];
}) {
  const { setFeedback } = useFeedbackContext();
  const [rows, setRows] = React.useState<NlqHistoryItem[]>(initialRows);
  const [loading, setLoading] = React.useState(false);

  // Filters
  const [email, setEmail] = React.useState("");
  const [tqFrom, setTqFrom] = React.useState("");
  const [tqTo, setTqTo] = React.useState("");
  const [trFrom, setTrFrom] = React.useState("");
  const [trTo, setTrTo] = React.useState("");

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await listNlqCorrectionsAction({
        emailContains: email || undefined,
        tqFrom: tqFrom || undefined,
        tqTo: tqTo || undefined,
        trFrom: trFrom || undefined,
        trTo: trTo || undefined,
        limit: 200,
      });
      setRows(data);
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Failed to load corrections",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        NLQ Corrections Needed
      </Typography>

      {/* Filters */}
      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="User email contains"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="time_question from"
            size="small"
            type="datetime-local"
            value={tqFrom}
            onChange={(e) => setTqFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="time_question to"
            size="small"
            type="datetime-local"
            value={tqTo}
            onChange={(e) => setTqTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="time_result from"
            size="small"
            type="datetime-local"
            value={trFrom}
            onChange={(e) => setTrFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="time_result to"
            size="small"
            type="datetime-local"
            value={trTo}
            onChange={(e) => setTrTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={fetchRows}>
            Search
          </Button>
          <Button
            variant="text"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setEmail("");
              setTqFrom("");
              setTqTo("");
              setTrFrom("");
              setTrTo("");
              fetchRows();
            }}
          >
            Reset
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper elevation={1}>
        {loading ? (
          <Box className="flex items-center justify-center py-10">
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SQL</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SQL is good</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Feedback</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>time_question</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>time_result</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No pending corrections 🎉
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.email || "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Box
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.question || "—"}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 420 }}>
                      <Box
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.sql_executed || "—"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {r.sql_is_good ? (
                        <Chip size="small" color="success" label="true" />
                      ) : (
                        <Chip size="small" color="error" label="false" />
                      )}
                    </TableCell>
                    <TableCell>
                      {r.user_feedback_id ? (
                        r.feedback_type === 1 ? (
                          <Chip size="small" color="success" label="good" />
                        ) : r.feedback_type === 0 ? (
                          <Chip size="small" color="error" label="bad" />
                        ) : (
                          <Chip size="small" label="unknown" />
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <LocalTime iso={r.time_question} />
                    </TableCell>
                    <TableCell>
                      <LocalTime iso={r.time_result} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit correction">
                        <IconButton
                          component={Link}
                          href={`/nlq-correction/${r.id}`} // route uses NLQ id
                          size="small"
                          aria-label="edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
