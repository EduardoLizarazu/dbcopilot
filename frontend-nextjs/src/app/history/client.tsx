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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";
import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";

export default function HistoryClient({
  initialRows,
}: {
  initialRows: TNlqQaWitFeedbackOutRequestDto[];
}) {
  const { setFeedback } = useFeedbackContext();
  const [rows, setRows] =
    React.useState<TNlqQaWitFeedbackOutRequestDto[]>(initialRows);
  const [query, setQuery] = React.useState("");
  const [deleteBusy, setDeleteBusy] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const question = (r.question || "").toLowerCase();
      const email = (r.user?.email || "").toLowerCase();
      return question.includes(q) || email.includes(q);
    });
  }, [rows, query]);

  const [sortDir, setSortDir] = React.useState<"desc" | "asc">("desc");

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

  const onDelete = async (id: string) => {
    const yes = window.confirm(
      "Delete this item? This action cannot be undone."
    );
    if (!yes) return;
    markDeleting(id, true);
    try {
      // For now perform optimistic local delete. Integrate backend delete call if available.
      setRows((prev) => prev.filter((r) => r.id !== id));
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Item deleted.",
      });
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Delete failed",
      });
    } finally {
      markDeleting(id, false);
    }
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        NLQ History
      </Typography>

      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by email or question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="sort-label">Sort by createdAt</InputLabel>
            <Select
              labelId="sort-label"
              label="Sort by createdAt"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
            >
              <MenuItem value="desc">Newest first</MenuItem>
              <MenuItem value="asc">Oldest first</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small" aria-label="nlq history table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
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
                  <TableCell sx={{ maxWidth: 640 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.user?.email || "—"}
                    </div>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 640 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.question
                        ? r.question.length > 100
                          ? `${r.question.slice(0, 100)}...`
                          : r.question
                        : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        component={Link}
                        href={`/nlq/${r.id}`}
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
                          disabled={deleteBusy.has(r.id)}
                        >
                          {deleteBusy.has(r.id) ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
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
    </Box>
  );
}
