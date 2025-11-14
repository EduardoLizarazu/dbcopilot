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
import { ReadAllRolesAction } from "@/_actions/roles/read-all.action";
import { DeleteRoleAction } from "@/_actions/roles/delete.action";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";

export default function RolesPage() {
  const [roles, setRoles] = React.useState<TRoleOutRequestDto[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleteBusy, setDeleteBusy] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  const markDeleting = (id: string, on: boolean) => {
    setDeleteBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  React.useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      const data = await ReadAllRolesAction();
      if (data.ok) {
        if (!active) return;
        setRoles(data.data);
        console.log(data);
      }
      if (!data.ok) {
        if (!active) return;
        setError(data.message || "Failed to load roles.");
      }
      if (active) setLoading(false);
    };

    (async () => run())();
    return () => {
      active = false;
    };
  }, []);

  // Filter roles based on the query
  const filteredRoles = roles?.filter((role) => {
    const query = q.toLowerCase();
    return (
      role.name.toLowerCase().includes(query) ||
      (role.description && role.description.toLowerCase().includes(query)) ||
      role.id.toLowerCase().includes(query)
    );
  });

  const onDelete = async (id: string) => {
    const yes = window.confirm("Remove this role? This cannot be undone.");
    if (!yes) return;

    setError(null);
    setSuccess(null);
    markDeleting(id, true);

    const res = await DeleteRoleAction(id);
    if (res.ok) {
      setSuccess(res.message || "Role removed successfully.");
      const data = await ReadAllRolesAction();
      setLoading(true);
      setRoles(data.data);
    } else {
      setError(res.message || "Failed to remove role.");
    }

    setTimeout(() => {
      setError(null);
      setSuccess(null);
      setLoading(false);
      markDeleting(id, false);
    }, 2000);
  };

  return (
    <Box className="max-w-7xl md:ml-0">
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h5" fontWeight={800}>
          Roles
        </Typography>
        <Button
          component={Link}
          href="/auth/roles/create"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none" }}
        >
          Create Role
        </Button>
      </Box>

      <Paper className="p-3 sm:p-4" elevation={1}>
        <Box className="flex items-center gap-2 mb-3">
          <SearchIcon fontSize="small" />
          <TextField
            size="small"
            placeholder="Search by name, description, or ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
        </Box>

        {error && <Alert security="error">{error}</Alert>}
        {success && <Alert security="success">{success}</Alert>}

        {loading && (
          <Box className="flex items-center justify-center py-12">
            <CircularProgress />
          </Box>
        )}
        {!loading && filteredRoles && filteredRoles.length === 0 && (
          <Box className="text-center py-1">
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No roles found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create your first role to get started.
            </Typography>
            <Button
              component={Link}
              href="/auth/roles/create"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Create Role
            </Button>
          </Box>
        )}

        {!loading && filteredRoles && filteredRoles.length > 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="roles table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoles.map((r) => {
                  const isDeleting = deleteBusy.has(r.id);
                  return (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.description || "—"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            component={Link}
                            href={`/auth/roles/${r.id}`}
                            aria-label="Edit role"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            onClick={() => {
                              onDelete(r.id);
                            }}
                            aria-label="Remove role"
                            size="small"
                            loading={isDeleting}
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
