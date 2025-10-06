"use client";
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { DeleteDbConnectionAction } from "@/_actions/dbconnection/delete.action";

export default function DbConnectionClient({
  initialData,
}: {
  initialData: TDbConnectionOutRequestDtoWithVbAndUser[];
}) {
  const [rows, setRows] = useState<TDbConnectionOutRequestDtoWithVbAndUser[]>(
    initialData || []
  );
  const [loading, setLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { setFeedback } = useFeedbackContext();

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await ReadAllDbConnectionAction();
      setRows(data.data || []);
    } catch (error) {
      console.error("Error fetching DB Connections:", error);
      setFeedback({
        message: "Error fetching DB Connections",
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

    const createdAt = row.createdAt ? new Date(row.createdAt) : null;

    const isWithinRange = (date: Date | null) => {
      if (!date) return true;
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    };

    const matchesName =
      row.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
      (row.description &&
        row.description.toLowerCase().includes(nameFilter.toLowerCase()));

    return matchesName && isWithinRange(createdAt);
  });

  const onDelete = async (id: string) => {
    setLoading(true);
    try {
      // Replace with actual delete action
      await DeleteDbConnectionAction(id);

      setFeedback({
        message: "DB Connection deleted successfully",
        severity: "success",
        isActive: true,
      });
      await refresh();
    } catch (error) {
      console.error("Error deleting DB Connection:", error);
      setFeedback({
        message: "Error deleting DB Connection",
        severity: "error",
        isActive: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        DB Connections
      </Typography>

      {/* Filters */}
      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Filter by name or description"
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
            href="/dbconnection/create"
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            Create DB Connection
          </Button>
        </Box>
      </Paper>

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
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Host</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Port</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>VBD Splitter</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
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
                      No DB Connections found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>
                        {row.description
                          ? row.description.length > 50
                            ? `${row.description.substring(0, 50)}...`
                            : row.description
                          : "-"}
                      </TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>{row.host}</TableCell>
                      <TableCell>{row.port}</TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>
                        {row.id_vbd_splitter ? (
                          <Chip
                            label="Associated"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Not Associated"
                            color="error"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              component={Link}
                              href={`/dbconnection/${row.id}`}
                              aria-label="Edit DB Connection"
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              aria-label="Delete DB Connection"
                              size="small"
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
