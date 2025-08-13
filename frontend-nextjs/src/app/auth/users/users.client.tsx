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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { listUsersAction, type UserRow } from "@/controller/_actions/user/list";
import { deleteUserAction } from "@/controller/_actions/user/delete";

export default function UsersClient({
  initialUsers,
}: {
  initialUsers: UserRow[];
}) {
  const [users, setUsers] = React.useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  // Debounced search (server action)
  React.useEffect(() => {
    const id = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listUsersAction(q);
        setUsers(data);
      } catch (e: any) {
        setError(e?.message ?? "Search failed.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const onDelete = async (id: string) => {
    const yes = window.confirm("Remove this user? This cannot be undone.");
    if (!yes) return;
    try {
      await deleteUserAction(id);
      const data = await listUsersAction(q);
      setUsers(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to remove user.");
    }
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
            placeholder="Search by name or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading && (
          <Box className="flex items-center justify-center py-8">
            <CircularProgress />
          </Box>
        )}

        {!loading && users.length === 0 && (
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

        {!loading && users.length > 0 && (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.name || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.roleName || "—"}</TableCell>
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
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
