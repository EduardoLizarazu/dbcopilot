"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Checkbox,
} from "@mui/material";
import { createUserAction } from "@/controller/_actions/user/create";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { CreateUserAction } from "@/_actions/users/create.action";

export default function UsersCreateClient({
  roles,
}: {
  roles: TRoleOutRequestDto[];
}) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [lastname, setLastname] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const toggleRole = (id: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await CreateUserAction({
        email,
        name,
        lastname,
        password,
        roles: selectedRoleIds,
      });
      if (res.data) {
        setSuccess("User created successfully. Redirecting to list…");
        setTimeout(() => router.replace("/auth/users"), 800);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-3xl mx-auto">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Create User
      </Typography>

      <Paper elevation={1} className="p-4 sm:p-6">
        <form onSubmit={onSubmit} noValidate>
          <Box display="grid" gap={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Lastname"
              value={lastname}
              required
              onChange={(e) => setLastname(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 6 characters (Firebase Auth default)"
              fullWidth
            />

            {/* Roles selection table */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Assign Roles
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small" aria-label="roles selection">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Select</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Description
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography color="text.secondary">
                            No roles available. You can create roles in{" "}
                            <strong>/auth/roles/create</strong>.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map((r) => {
                        const checked = selectedRoleIds.includes(r.id);
                        return (
                          <TableRow key={r.id} hover>
                            <TableCell width={90}>
                              <Checkbox
                                checked={checked}
                                onChange={() => toggleRole(r.id)}
                                inputProps={{
                                  "aria-label": `select role ${r.name}`,
                                }}
                              />
                            </TableCell>
                            <TableCell>{r.name}</TableCell>
                            <TableCell>{r.description || "—"}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box display="flex" gap={1} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                {loading ? <CircularProgress size={22} /> : "Create"}
              </Button>

              <Button
                component={Link}
                href="/auth/users"
                variant="outlined"
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
