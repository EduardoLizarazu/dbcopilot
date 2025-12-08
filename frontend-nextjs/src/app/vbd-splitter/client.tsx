"use client";

import { TVbdSplitterWithUserDto } from "@/core/application/dtos/vbd.dto";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { LocalTime } from "@/components/shared/LocalTime";
import { convertFbDateToISO } from "@/_actions/utils/date-transf.action";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Tooltip } from "@mui/material";
import { DeleteVbdSplitterAction } from "@/_actions/vbd-splitter/delete.action";
import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";

export default function VbdSplitterClient({
  initialRows,
}: {
  initialRows: TVbdSplitterWithUserDto[];
}) {
  const [rows, setRows] = useState<TVbdSplitterWithUserDto[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [createBtnLoading, setCreateBtnLoading] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState<Set<string>>(new Set());
  const [updateBusy, setUpdateBusy] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const markDeleting = (id: string, on: boolean) => {
    setDeleteBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  const markUpdating = (id: string, on: boolean) => {
    setUpdateBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await ReadAllVbdSplitterAction();
      if (r.ok) {
        setRows(r.data || []);
      }

      if (!r.ok) {
        console.warn("Error fetching VBD Splitters:", r.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter((row) => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    const createdAt = row.createdAt
      ? new Date(convertFbDateToISO(row.createdAt as any) || "")
      : null;

    const isWithinRange = (date: Date | null) => {
      if (!date) return true;
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    };

    const q = nameFilter.trim().toLowerCase();
    const matchesNameOrEmail = (() => {
      if (!q) return true;
      const name = (row.name || "").toLowerCase();
      const email = (row.user?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    })();

    return matchesNameOrEmail && isWithinRange(createdAt);
  });

  const onDelete = async (id: string) => {
    markDeleting(id, true);
    markUpdating(id, false);
    setError(null);
    setSuccess(null);
    setLoading(false);
    try {
      const r = await DeleteVbdSplitterAction(id);

      if (r.ok) {
        setSuccess(r.message || "VBD Splitter deleted successfully.");
        await refresh();
      }

      if (!r.ok) {
        console.error("Error deleting VBD Splitter:", r.message);
        setError(r.message || "Failed to delete VBD Splitter.");
      }
    } finally {
      markDeleting(id, false);
      setDeleteBusy(new Set());
      setUpdateBusy(new Set());
    }
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
          VBD Splitters
        </Typography>
        <Button
          component={Link}
          href="/vbd-splitter/create"
          variant="contained"
          startIcon={<AddIcon />}
          loading={createBtnLoading}
          disabled={createBtnLoading}
          onClick={() => setCreateBtnLoading(true)}
        >
          Create
        </Button>
      </Box>

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
              label="Created From"
              size="small"
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Created To"
              size="small"
              type="datetime-local"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box className="flex items-center gap-2 mb-2 mt-3">
            <SearchIcon fontSize="small" />
            <TextField
              label="Search by splitter name or user email"
              size="small"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      </Paper>

      {/* Feedback Snackbar */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

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
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ py: 6, color: "text.secondary" }}
                    >
                      No VBD Splitters found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => {
                    const isDeleting = deleteBusy.has(row.id);
                    const isUpdating = updateBusy.has(row.id);
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.name || "-"}</TableCell>
                        <TableCell>{row?.user?.email || "-"}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <LocalTime fb_date={row.createdAt as any} />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                component={Link}
                                href={`/vbd-splitter/${row.id}`}
                                aria-label="Edit VBD Splitter"
                                size="small"
                                disabled={isDeleting || isUpdating}
                                loading={isUpdating}
                                onClick={() => markUpdating(row.id, true)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                aria-label="Delete VBD Splitter"
                                size="small"
                                disabled={isDeleting || isUpdating}
                                loading={isDeleting}
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to delete this item?"
                                    )
                                  ) {
                                    onDelete(row.id);
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
