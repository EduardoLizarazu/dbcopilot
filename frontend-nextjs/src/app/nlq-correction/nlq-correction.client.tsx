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
  TableContainer,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";
import { ReadAllNlqQaBadAction } from "@/_actions/nlq-qa-correction/read-all.action";
import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { convertFbDateToISO } from "@/_actions/utils/date-transf.action";

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

    const timeQuestion = r.timeQuestion
      ? new Date(
          convertFbDateToISO(
            r.timeQuestion as unknown as {
              _seconds: number;
              _nanoseconds: number;
            }
          ) || ""
        )
      : null;

    const isWithinRange = (time) => {
      if (!time) return true; // Include rows with null timeQuestion
      if (from && time < from) return false;
      if (to && time > to) return false;
      return true;
    };

    const matchesType = () => {
      if (kind === "feedback") return !!r.feedback; // Ensure feedback is truthy
      if (kind === "error") return !!r.error; // Ensure error is truthy
      if (kind === "all") return true;
      return false;
    };

    return matchesType() && isWithinRange(timeQuestion);
  });

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        NLQ Corrections Needed
      </Typography>

      {/* Filters */}
      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
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
          </Box>
          <Box className="flex items-center gap-2 mb-3">
            <SearchIcon fontSize="small" />
            <TextField
              label="Search..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={1}>
        {loading ? (
          <Box className="flex items-center justify-center py-10">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
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
                    <TableRow key={r.id} hover>
                      <TableCell>{r.user?.email || "—"}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 360,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Tooltip title={r.question || "—"}>
                          <span>
                            {r.question
                              ? r.question.length > 30
                                ? `${r.question.slice(0, 30)}...`
                                : r.question
                              : "—"}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 360 }}>
                        <Box
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {!!r.feedback &&
                            (r.feedback.isGood ? (
                              <Chip
                                label="Feedback"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                label="Feedback"
                                color="error"
                                size="small"
                              />
                            ))}
                          {!!r.error ? (
                            <Chip label="Error" color="error" size="small" />
                          ) : null}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <LocalTime
                          fb_date={
                            r.timeQuestion as unknown as {
                              _seconds: number;
                              _nanoseconds: number;
                            }
                          }
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Edit correction">
                          <IconButton
                            component={Link}
                            href={`/nlq-correction/${r.id}`}
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
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
