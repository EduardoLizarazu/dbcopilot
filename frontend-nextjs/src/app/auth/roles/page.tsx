// import React, { Suspense } from "react";
// import { CircularProgress, Container, Typography } from "@mui/material";
// import { TableHeadRole } from "@/components/role/tableHeadRole";
// import { ReadAllRolesAction } from "@/controller/_actions/role/query/read-all-roles.action";

// type TReadRole = {
//   id: number;
//   name: string;
//   description?: string;
// };

// export default async function RolesPage() {
//   const data: TReadRole[] = await ReadAllRolesAction();
//   return (
//     <Suspense fallback={<CircularProgress />}>
//       <Container>
//         <Typography variant="h4">Roles</Typography>
//         <TableHeadRole fetchedData={data} />
//       </Container>
//     </Suspense>
//   );
// }

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
import { listRolesAction, type Role } from "@/controller/_actions/role/list";
import { deleteRoleAction } from "@/controller/_actions/role/delete";

export default function RolesPage() {
  const [roles, setRoles] = React.useState<Role[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listRolesAction("");
        if (!active) return;
        setRoles(data);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Failed to load roles.");
      } finally {
        if (active) setLoading(false);
      }
    };

    (async () => run())();
    return () => {
      active = false;
    };
  }, []);

  // Debounced remote search (keeps logic server-side per your requirement)
  React.useEffect(() => {
    let stop = false;
    const id = setTimeout(async () => {
      if (stop) return;
      try {
        const data = await listRolesAction(q);
        if (!stop) setRoles(data);
      } catch (e: any) {
        if (!stop) setError(e?.message ?? "Search failed.");
      }
    }, 300);
    console.log("Searching roles for:", q);

    return () => {
      stop = true;
      clearTimeout(id);
    };
  }, [q]);

  const onDelete = async (id: string) => {
    const yes = window.confirm("Remove this role? This cannot be undone.");
    if (!yes) return;
    try {
      await deleteRoleAction(id);
      // Re-query with current search
      const data = await listRolesAction(q);
      setRoles(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to remove role.");
    }
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
            placeholder="Search by name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
          />
        </Box>

        {loading && (
          <Box className="flex items-center justify-center py-12">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && roles && roles.length === 0 && (
          <Box className="text-center py-16">
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

        {!loading && roles && roles.length > 0 && (
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
                {roles.map((r) => (
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
                          onClick={() => onDelete(r.id)}
                          aria-label="Remove role"
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
