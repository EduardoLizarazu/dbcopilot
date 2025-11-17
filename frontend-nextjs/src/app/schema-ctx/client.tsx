"use client";
import * as React from "react";
import Link from "next/link";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Tooltip,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { ReadAllSchemaCtxAction } from "@/_actions/schemaCtx/read-all.action";
import { DeleteSchemaCtxByIdAction } from "@/_actions/schemaCtx/delete.action";

export function SchemaCtxClient({
  initialRows,
}: {
  initialRows: TSchemaCtxBaseDto[];
}) {
  const [rows, setRows] = React.useState<TSchemaCtxBaseDto[] | null>(
    initialRows || []
  );
  const [loading, setLoading] = React.useState<boolean>(!initialRows);
  const [q, setQ] = React.useState("");
  const [deleteBusy, setDeleteBusy] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const markDeleting = (id: string, on: boolean) => {
    setDeleteBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ReadAllSchemaCtxAction();
      if (res.ok) setRows(res.data || []);
      else setError(res.message || "Failed to load schema contexts");
    } catch (err: any) {
      setError(err?.message || "Failed to load schema contexts");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!initialRows || initialRows.length === 0) {
        await refresh();
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = (rows || []).filter((r) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    const name = (r.name || "").toLowerCase();
    const desc = (r.description || "").toLowerCase();
    const connCount = String((r.dbConnectionIds || []).length);
    return (
      name.includes(query) || desc.includes(query) || connCount.includes(query)
    );
  });

  const onDelete = async (id: string) => {
    const yes = window.confirm(
      "Remove this schema context? This cannot be undone."
    );
    if (!yes) return;
    setError(null);
    setSuccess(null);
    markDeleting(id, true);
    try {
      const res = await DeleteSchemaCtxByIdAction(id);
      if (res.ok) {
        setSuccess(res.message || "Schema context deleted");
        await refresh();
      } else {
        setError(res.message || "Failed to delete schema context");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to delete schema context");
    } finally {
      markDeleting(id, false);
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 2500);
    }
  };

  return (
    <Box className="max-w-7xl md:ml-0">
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h5" fontWeight={800}>
          Schema Contexts
        </Typography>
        <Button
          component={Link}
          href="/schema-ctx/create"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none" }}
        >
          Create Schema Context
        </Button>
      </Box>

      <Paper className="p-3 sm:p-4" elevation={1}>
        <Box className="flex items-center gap-2 mb-3">
          <SearchIcon fontSize="small" />
          <TextField
            size="small"
            placeholder="Search by name, description, or # connections..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {loading && (
          <Box className="flex items-center justify-center py-12">
            <CircularProgress />
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Box className="text-center py-1">
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No schema contexts found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create your first schema context to get started.
            </Typography>
            <Button
              component={Link}
              href="/schema-ctx/create"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Create Schema Context
            </Button>
          </Box>
        )}

        {!loading && filtered.length > 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="schema contexts table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}># Connections</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((ctx) => {
                  const isDeleting = deleteBusy.has(ctx.id);
                  const desc = (ctx.description || "") as string;
                  const shortDesc =
                    desc.length > 10 ? `${desc.slice(0, 10)}...` : desc;
                  const connCount = (ctx.dbConnectionIds || []).length;
                  return (
                    <TableRow key={ctx.id} hover>
                      <TableCell>{ctx.name}</TableCell>
                      <TableCell>{shortDesc || "—"}</TableCell>
                      <TableCell>{connCount}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            component={Link}
                            href={`/schema-ctx/${ctx.id}`}
                            aria-label="Edit schema context"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            onClick={() => onDelete(ctx.id)}
                            aria-label="Remove schema context"
                            size="small"
                            disabled={isDeleting}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
