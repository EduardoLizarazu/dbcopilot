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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";
import { TNlqQaHistoryOutDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";

export default function HistoryClient({
  initialRows,
}: {
  initialRows: TNlqQaHistoryOutDto[];
}) {
  const { setFeedback } = useFeedbackContext();
  const [rows, setRows] = React.useState<TNlqQaHistoryOutDto[]>(initialRows);
  const [query, setQuery] = React.useState("");
  const [deleteBusy, setDeleteBusy] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => (r.question || "").toLowerCase().includes(q));
  }, [rows, query]);

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
        <TextField
          size="small"
          placeholder="Search by question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
      </Paper>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small" aria-label="nlq history table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ maxWidth: 640 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.question || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.createdAt ? (
                      <LocalTime iso={new Date(r.createdAt).toISOString()} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        component={Link}
                        href={`/history/${r.id}`}
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
