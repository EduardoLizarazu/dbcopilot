"use client";

import * as React from "react";
import Link from "next/link";
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
  IconButton,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";
import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { DeleteHistoryByIdAction } from "@/_actions/nlq-qa/history/delete-history-by-id.action";
import { ReadAllNlqHistoryAction } from "@/_actions/nlq-qa/history/read-history.action";

export default function HistoryClient({
  initialRows,
}: {
  initialRows: TNlqQaWitFeedbackOutRequestDto[];
}) {
  const [rows, setRows] =
    React.useState<TNlqQaWitFeedbackOutRequestDto[]>(initialRows);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState<Set<string>>(new Set());
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");
  const getTime = (val: any) => {
    if (!val) return 0;
    // Firestore-like timestamp
    if (
      typeof val === "object" &&
      Object.prototype.hasOwnProperty.call(val, "_seconds")
    ) {
      return (val._seconds || 0) * 1000 + (val._nanoseconds || 0) / 1e6;
    }
    // JS Date
    if (val instanceof Date) return val.getTime();
    // ISO string or number
    const d = new Date(val);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = endDate ? new Date(endDate).getTime() : Infinity;

    return rows.filter((r) => {
      // Text search
      if (q) {
        const question = (r.question || "").toLowerCase();
        const email = (r.user?.email || "").toLowerCase();
        if (!question.includes(q) && !email.includes(q)) return false;
      }
      // Date range search
      const rTime = getTime(r.createdAt);
      if (rTime < start || rTime > end) return false;
      return true;
    });
  }, [rows, query, startDate, endDate]);

  const [sortDir, setSortDir] = React.useState<"desc" | "asc">("desc");

  const displayed = React.useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => {
      const at = getTime(a.createdAt);
      const bt = getTime(b.createdAt);
      return sortDir === "desc" ? bt - at : at - bt;
    });
    return arr;
  }, [filtered, sortDir]);

  const markDeleting = (id: string, on: boolean) => {
    setDeleteBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  const refresh = async () => {
    setLoading(true);
    const res = await ReadAllNlqHistoryAction();
    if (res.ok) {
      setRows(res.data);
    }
    if (!res.ok) {
      setError(res.message || "Failed to refresh data");
    }
    setLoading(false);
  };

  const onDelete = async (id: string) => {
    const yes = window.confirm(
      "Delete this item? This action cannot be undone."
    );
    if (!yes) return;
    markDeleting(id, true);
    setSuccess(null);
    setError(null);
    const res = await DeleteHistoryByIdAction(id);
    if (res.ok) {
      setSuccess(res.message || "Item deleted.");
      markDeleting(id, false);
    }

    if (!res.ok) {
      setError(res.message || "Delete failed");
      markDeleting(id, false);
    }

    setTimeout(async () => {
      setSuccess(null);
      setError(null);
      setDeleteBusy(new Set());
      await refresh();
    }, 2000);
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        NLQ History
      </Typography>

      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Date Range */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              size="small"
              label="From"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              size="small"
              label="To"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="sort-label">Sort</InputLabel>
              <Select
                labelId="sort-label"
                label="Sort"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as any)}
              >
                <MenuItem value="desc">Newest</MenuItem>
                <MenuItem value="asc">Oldest</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Search Bar - Full Width */}
          <TextField
            size="small"
            placeholder="Search by email or question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
        </Box>
      </Paper>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={1}>
        {loading ? (
          <Box className="flex items-center justify-center py-10">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="nlq history table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    Question
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    Created At
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayed.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayed.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell
                        sx={{
                          maxWidth: 640,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.user?.email || "—"}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 640,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Tooltip title={r.question || ""}>
                          <span>
                            {r.question
                              ? r.question.length > 50
                                ? `${r.question.slice(0, 50)}...`
                                : r.question
                              : "—"}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {r.createdAt ? (
                          <LocalTime
                            fb_date={
                              r.createdAt
                                ? (r.createdAt as unknown as {
                                    _seconds: number;
                                    _nanoseconds: number;
                                  })
                                : undefined
                            }
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            component={Link}
                            href={`/chat/${r.id}`}
                            size="small"
                            aria-label="edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              onClick={() => onDelete(r.id)}
                              size="small"
                              aria-label="delete"
                              loading={deleteBusy.has(r.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
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
