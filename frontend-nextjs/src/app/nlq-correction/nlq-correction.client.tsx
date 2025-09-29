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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";
import { ReadAllNlqQaBadAction } from "@/_actions/nlq-qa-correction/read-all.action";
import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";

export default function NlqCorrectionsClient({
  initialRows,
}: {
  initialRows: TNlqQaWitFeedbackOutRequestDto[];
}) {
  const { setFeedback } = useFeedbackContext();
  const [rows, setRows] =
    React.useState<TNlqQaWitFeedbackOutRequestDto[]>(initialRows);
  const [loading, setLoading] = React.useState(false);

  // Filters
  const [email, setEmail] = React.useState("");
  const [tqFrom, setTqFrom] = React.useState("");
  const [tqTo, setTqTo] = React.useState("");
  const [kind, setKind] = React.useState<"all" | "feedback" | "error">("all");
  const [search, setSearch] = React.useState(""); // just to trigger search on Enter

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await ReadAllNlqQaBadAction(search);
      setRows(data.data || []);
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

  const filteredRows = rows.filter((r) => {
    const from = tqFrom ? new Date(tqFrom) : null;
    const to = tqTo ? new Date(tqTo) : null;

    const feedbackTime = r.byFeedback
      ? new Date(
          r.byFeedback.timeQuestion._seconds * 1000 +
            r.byFeedback.timeQuestion._nanoseconds / 1e6
        )
      : null;

    const errorTime = r.byError
      ? new Date(
          r.byError.createdAt._seconds * 1000 +
            r.byError.createdAt._nanoseconds / 1e6
        )
      : null;

    const isWithinRange = (time) => {
      if (!time) return false;
      if (from && time < from) return false;
      if (to && time > to) return false;
      return true;
    };

    if (kind === "feedback") return r.byFeedback && isWithinRange(feedbackTime);
    if (kind === "error") return r.byError && isWithinRange(errorTime);
    return (
      (r.byFeedback && isWithinRange(feedbackTime)) ||
      (r.byError && isWithinRange(errorTime))
    );
  });

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        NLQ Corrections Needed
      </Typography>

      {/* Filters */}
      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Search..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="kind-label">Show</InputLabel>
            <Select
              labelId="kind-label"
              label="Show"
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="feedback">Feedback</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>
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
              setKind("all");
              setSearch("");
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
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>time_question</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length === 0 ? (
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
                filteredRows.map((r) => (
                  <TableRow
                    key={r.byFeedback ? r.byFeedback.id : r.byError.id}
                    hover
                  >
                    <TableCell>
                      {r.byFeedback
                        ? r.byFeedback.user.email || "—"
                        : r.byError.user.email || "—"}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Box
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.byFeedback
                          ? r.byFeedback.question || "—"
                          : r.byError.question || "—"}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Box
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.byFeedback ? (
                          r.byFeedback.isGood ? (
                            <Chip
                              label="Feedback"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip label="Feedback" color="error" size="small" />
                          )
                        ) : (
                          <Chip label="Error" color="error" size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <LocalTime
                        iso={
                          r.byFeedback
                            ? r.byFeedback.timeQuestion &&
                              r.byFeedback.timeQuestion._seconds &&
                              !isNaN(
                                new Date(
                                  r.byFeedback.timeQuestion._seconds * 1000 +
                                    r.byFeedback.timeQuestion._nanoseconds / 1e6
                                ).getTime()
                              )
                              ? new Date(
                                  r.byFeedback.timeQuestion._seconds * 1000 +
                                    r.byFeedback.timeQuestion._nanoseconds / 1e6
                                ).toISOString()
                              : undefined
                            : r.byError.createdAt &&
                                r.byError.createdAt._seconds &&
                                !isNaN(
                                  new Date(
                                    r.byError.createdAt._seconds * 1000 +
                                      r.byError.createdAt._nanoseconds / 1e6
                                  ).getTime()
                                )
                              ? new Date(
                                  r.byError.createdAt._seconds * 1000 +
                                    r.byError.createdAt._nanoseconds / 1e6
                                ).toISOString()
                              : undefined
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit correction">
                        <IconButton
                          component={Link}
                          href={`/nlq-correction/${r.byFeedback ? r.byFeedback.feedback.id : r.byError.id}`}
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
