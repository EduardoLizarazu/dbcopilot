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
import RefreshIcon from "@mui/icons-material/Refresh";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { LocalTime } from "@/components/shared/LocalTime";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import { TNlqQaGoodOutWithUserAndConnRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { ReadAllNlqQaGoodAction } from "@/_actions/nlq-qa-good/read-all.action";
import { UpdateNlqQaGoodAction } from "@/_actions/nlq-qa-good/update.action";
import { convertFbDateToISO } from "@/_actions/utils/date-transf.action";

export default function NlqGoodClient({
  initialRows,
}: {
  initialRows: TNlqQaGoodOutWithUserAndConnRequestDto[];
}) {
  const { setFeedback } = useFeedbackContext();
  const [rows, setRows] =
    React.useState<TNlqQaGoodOutWithUserAndConnRequestDto[]>(initialRows);
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
      const data = await ReadAllNlqQaGoodAction();
      setRows(data.data || []);
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
      await UpdateNlqQaGoodAction({
        id: nlqId,
        isOnKnowledgeSource: true,
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
      await UpdateNlqQaGoodAction({
        id: nlqId,
        isOnKnowledgeSource: false,
      });
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
      if (!r.isOnKnowledgeSource || !r.createdAt) return false;

      // Convert Firestore date to ISO string
      const isoDate = convertFbDateToISO(
        r.createdAt as unknown as {
          _seconds: number;
          _nanoseconds: number;
        }
      );

      if (!isoDate) return false;

      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    arr.sort((a, b) => {
      const ad = convertFbDateToISO(
        a.createdAt as unknown as {
          _seconds: number;
          _nanoseconds: number;
        }
      );
      const bd = convertFbDateToISO(
        b.createdAt as unknown as {
          _seconds: number;
          _nanoseconds: number;
        }
      );

      const adTime = ad ? new Date(ad).getTime() : 0;
      const bdTime = bd ? new Date(bd).getTime() : 0;

      return sortDir === "desc" ? bdTime - adTime : adTime - bdTime;
    });

    return arr;
  }, [rows, vbdFrom, vbdTo, sortDir]);

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        NLQ Goods
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
                <TableCell sx={{ fontWeight: 700 }}>
                  Connection Status
                </TableCell>
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
                      <TableCell>{r.user.email || "—"}</TableCell>
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
                        {r.isOnKnowledgeSource ? (
                          <Chip size="small" color="success" label="true" />
                        ) : (
                          <Chip size="small" variant="outlined" label="false" />
                        )}
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
                      <TableCell>
                        {r.dbConnection ? (
                          r.dbConnection && r.dbConnection.id_vbd_splitter ? (
                            <Chip
                              size="small"
                              color="success"
                              label="Connected"
                            />
                          ) : r.dbConnection &&
                            !r.dbConnection.id_vbd_splitter ? (
                            <Chip
                              size="small"
                              color="warning"
                              label="Not Splitter"
                            />
                          ) : (
                            <Chip
                              size="small"
                              variant="outlined"
                              label="Disconnected"
                            />
                          )
                        ) : (
                          <Chip
                            size="small"
                            color="error"
                            label="Disconnected"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit NLQ">
                          <IconButton
                            component={Link}
                            href={`/nlq-good/${r.id}`}
                            size="small"
                            aria-label="edit"
                            sx={{ ml: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {r.isOnKnowledgeSource ? (
                          <>
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
                                    <CloudDoneIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
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
                                  <CloudOffIcon fontSize="small" />
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
