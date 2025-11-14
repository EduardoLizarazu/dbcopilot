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
import { TUserOutRequestWithRoles } from "@/core/application/dtos/user.app.dto";
import { ReadAllUserAction } from "@/_actions/users/read-all.action";
import { DeleteUserAction } from "@/_actions/users/delete.action";

export default function UsersClient({
  initialUsers,
}: {
  initialUsers: TUserOutRequestWithRoles[];
}) {
  const [users, setUsers] =
    React.useState<TUserOutRequestWithRoles[]>(initialUsers);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState<Set<string>>(new Set());
  const [q, setQ] = React.useState("");

  const markDeleting = (id: string, on: boolean) => {
    setDeleteBusy((prev) => {
      const s = new Set(prev);
      on ? s.add(id) : s.delete(id);
      return s;
    });
  };

  // Filter users based on the query
  const filteredUsers = users.filter((user) => {
    const query = q.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      (user.lastname &&
        `${user.name} ${user.lastname}`.toLowerCase().includes(query)) ||
      user.email.toLowerCase().includes(query) ||
      user.rolesDetail.some((role) =>
        role.name.toLowerCase().includes(query)
      ) ||
      user.id.toLowerCase().includes(query)
    );
  });

  const onDelete = async (id: string) => {
    const yes = window.confirm("Remove this user? This cannot be undone.");
    if (!yes) return;

    setLoading(false);
    setError(null);
    setSuccess(null);
    markDeleting(id, true);
    const res = await DeleteUserAction(id);
    if (res.ok) {
      const data = await ReadAllUserAction();
      setUsers(data.data || []);
      setSuccess("User removed successfully.");
      setLoading(true);
    }
    if (!res.ok) {
      setError(res.message || "Failed to remove user.");
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
      markDeleting(id, false);
      setDeleteBusy(new Set());
      setLoading(false);
    }, 2000);
  };

  return (
    <Box className="max-w-7xl mx-auto">
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h5" fontWeight={800}>
          Users
        </Typography>
        <Button
          component={Link}
          href="/auth/users/create"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none" }}
        >
          Create User
        </Button>
      </Box>

      <Paper className="p-3 sm:p-4" elevation={1}>
        <Box className="flex items-center gap-2 mb-3">
          <SearchIcon fontSize="small" />
          <TextField
            size="small"
            placeholder="Search by name, email, roles, or ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
        </Box>

        {error && <Alert color="error">{error}</Alert>}
        {success && <Alert color="success">{success}</Alert>}

        {loading && (
          <Box className="flex items-center justify-center py-8">
            <CircularProgress />
          </Box>
        )}

        {!loading && filteredUsers.length === 0 && (
          <Box className="text-center py-16">
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Create your first user to get started.
            </Typography>
            <Button
              component={Link}
              href="/auth/users/create"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2, textTransform: "none" }}
            >
              Create User
            </Button>
          </Box>
        )}

        {!loading && filteredUsers.length > 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => {
                  const isDeleting = deleteBusy.has(u.id);
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        {u.lastname ? `${u.name} ${u.lastname}` : u.name || "—"}
                      </TableCell>
                      <TableCell>{u.email || "—"}</TableCell>
                      <TableCell>
                        {u.rolesDetail.map((role) => role.name).join(", ") ||
                          "—"}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            component={Link}
                            href={`/auth/users/${u.id}`}
                            aria-label="Edit user"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            onClick={() => onDelete(u.id)}
                            aria-label="Remove user"
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
