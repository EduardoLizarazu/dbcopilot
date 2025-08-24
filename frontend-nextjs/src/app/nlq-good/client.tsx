"use client";

import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  listNlqGoodAction,
  type NlqGoodItem,
} from "@/controller/_actions/nlq/list-good";
import { deleteNlqVbdAction } from "@/controller/_actions/nlq/delete-vbd";
import { uploadNlqToVbdAction } from "@/controller/_actions/nlq/upload-vbd";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";

export default function NlqGoodClient({
  initialRows,
}: {
  initialRows: NlqGoodItem[];
}) {
  const { setFeedback } = useFeedbackContext();
  const [rows, setRows] = React.useState<NlqGoodItem[]>(initialRows);
  const [loading, setLoading] = React.useState(false);

  // Filters & ordering for VBD createdAt
  const [vbdFrom, setVbdFrom] = React.useState("");
  const [vbdTo, setVbdTo] = React.useState("");
  const [sortDir, setSortDir] = React.useState<"desc" | "asc">("desc");

  // Per-row busy states (no dialogs)
  const [uploadBusy, setUploadBusy] = React.useState<Set<string>>(new Set());
  const [deleteBusy, setDeleteBusy] = React.useState<Set<string>>(new Set());

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listNlqGoodAction(300);
      setRows(data);
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Failed to load",
      });
    } finally {
      setLoading(false);
    }
  };

  const markUploading = (id: string, on: boolean) => {
    setUploadBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  const markDeleting = (id: string, on: boolean) => {
    setDeleteBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  // UPLOAD: immediate, general_* = ""
  const onUpload = async (nlqId: string) => {
    markUploading(nlqId, true);
    try {
      await uploadNlqToVbdAction({
        nlqId,
        general_query: "",
        general_question: "",
      });
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Uploaded to Pinecone & VBD.",
      });
      await refresh();
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Upload failed",
      });
    } finally {
      markUploading(nlqId, false);
    }
  };

  // DELETE: immediate (no confirm)
  const onDelete = async (nlqId: string) => {
    markDeleting(nlqId, true);
    try {
      await deleteNlqVbdAction(nlqId);
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Removed from Pinecone/VBD and NLQ updated.",
      });
      await refresh();
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Delete failed",
      });
    } finally {
      markDeleting(nlqId, false);
    }
  };

  // Apply VBD date filters + ordering on the client
  const filteredSorted = React.useMemo(() => {
    const from = vbdFrom ? new Date(vbdFrom) : null;
    const to = vbdTo ? new Date(vbdTo) : null;

    let arr = rows.filter((r) => {
      if (!from && !to) return true;
      if (!r.uploaded || !r.vbd_created_at) return false;
      const d = new Date(r.vbd_created_at);
      if (isNaN(d.getTime())) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    arr.sort((a, b) => {
      const ad = a.vbd_created_at ? new Date(a.vbd_created_at).getTime() : 0;
      const bd = b.vbd_created_at ? new Date(b.vbd_created_at).getTime() : 0;
      return sortDir === "desc" ? bd - ad : ad - bd;
    });

    return arr;
  }, [rows, vbdFrom, vbdTo, sortDir]);

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        NLQ Uploaded (sql_is_good = true)
      </Typography>

      {/* Filters + Refresh */}
      <Paper className="p-3 sm:p-4" elevation={1} sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="VBD createdAt from"
            size="small"
            type="datetime-local"
            value={vbdFrom}
            onChange={(e) => setVbdFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="VBD createdAt to"
            size="small"
            type="datetime-local"
            value={vbdTo}
            onChange={(e) => setVbdTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="order-label">Order by VBD createdAt</InputLabel>
            <Select
              labelId="order-label"
              label="Order by VBD createdAt"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
            >
              <MenuItem value="desc">Newest first</MenuItem>
              <MenuItem value="asc">Oldest first</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            sx={{ ml: { md: "auto" } }}
          >
            Refresh
          </Button>
          <Button
            component={Link}
            href="/nlq-good/create"
            variant="outlined"
            startIcon={<AddIcon />}
          >
            Create
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
                <TableCell sx={{ fontWeight: 700 }}>Upload</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>VBD createdAt</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSorted.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSorted.map((r) => {
                  const isUploading = uploadBusy.has(r.id);
                  const isDeleting = deleteBusy.has(r.id);
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.email || "—"}</TableCell>
                      <TableCell sx={{ maxWidth: 480 }}>
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
                      <TableCell>
                        {r.uploaded ? (
                          <Chip size="small" color="success" label="true" />
                        ) : (
                          <Chip size="small" variant="outlined" label="false" />
                        )}
                      </TableCell>
                      <TableCell>
                        {r.vbd_created_at ? (
                          <LocalTime iso={r.vbd_created_at} />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {r.uploaded ? (
                          <Tooltip
                            title={
                              isDeleting
                                ? "Deleting..."
                                : "Delete from Pinecone & VBD"
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => onDelete(r.id)}
                                size="small"
                                aria-label="delete"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <DeleteIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={
                              isUploading
                                ? "Uploading..."
                                : "Upload to Pinecone & VBD"
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => onUpload(r.id)}
                                size="small"
                                aria-label="upload"
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <CloudUploadIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
