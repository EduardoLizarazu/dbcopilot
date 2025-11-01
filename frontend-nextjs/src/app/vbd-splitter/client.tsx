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
import { IconButton, Tooltip } from "@mui/material";
import { DeleteVbdSplitterAction } from "@/_actions/vbd-splitter/delete.action";
import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";
import { useFeedbackContext } from "@/contexts/feedback.context";

export default function VbdSplitterClient({
  initialRows,
}: {
  initialRows: TVbdSplitterWithUserDto[];
}) {
  const [rows, setRows] = useState<TVbdSplitterWithUserDto[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { setFeedback } = useFeedbackContext();
  const [deleteLoading, setDeleteLoading] = useState({
    id: "",
    loading: false,
  });

  const [fb, setFb] = useState<{
    isActive: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    isActive: false,
    message: "",
    severity: "success",
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await ReadAllVbdSplitterAction();
      setRows(data.data || []);
    } catch (error) {
      console.error("Error fetching VBD Splitters:", error);
      setFeedback({
        message: "Error fetching VBD Splitters",
        severity: "error",
        isActive: true,
      });
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

    const matchesName = row.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());

    return matchesName && isWithinRange(createdAt);
  });

  const onDelete = async (id: string) => {
    setDeleteLoading({ id, loading: true });
    try {
      await DeleteVbdSplitterAction(id);
      setFb({
        message: "VBD Splitter deleted successfully",
        severity: "success",
        isActive: true,
      });
      await refresh();
    } catch (error) {
      console.error("Error deleting VBD Splitter:", error);
      setFb({
        message: error.message || "Error deleting VBD Splitter",
        severity: "error",
        isActive: true,
      });
    } finally {
      setDeleteLoading({ id: "", loading: false });
    }
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        VBD Splitters
      </Typography>

      {/* Filters */}
      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Filter by name"
            size="small"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
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
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Button
            component={Link}
            href="/vbd-splitter/create"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Create VBD Splitter
          </Button>
        </Box>
      </Paper>

      {/* Feedback Snackbar */}
      {fb.isActive && (
        <Box sx={{ mb: 2 }}>
          <Alert
            severity={fb.severity}
            onClose={() => setFb({ ...fb, isActive: false })}
          >
            {fb.message}
          </Alert>
        </Box>
      )}

      {/* Table */}
      <Paper elevation={1}>
        {loading ? (
          <Box className="flex items-center justify-center py-10">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
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
                  filteredRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.name || "-"}</TableCell>
                      <TableCell>{row?.user?.email || "-"}</TableCell>
                      <TableCell>
                        <LocalTime fb_date={row.createdAt as any} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              component={Link}
                              href={`/vbd-splitter/${row.id}`}
                              aria-label="Edit VBD Splitter"
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              aria-label="Delete VBD Splitter"
                              size="small"
                              loading={
                                deleteLoading && deleteLoading.id === row.id
                              }
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
