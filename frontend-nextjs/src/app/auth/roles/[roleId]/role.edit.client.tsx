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
} from "@mui/material";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { UpdateRoleAction } from "@/_actions/roles/update.actiont";

export default function EditRoleClient({
  initialRole,
}: {
  initialRole: TRoleOutRequestDto;
}) {
  const router = useRouter();

  const [name, setName] = React.useState(initialRole.name);
  const [description, setDescription] = React.useState(
    initialRole.description ?? ""
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await UpdateRoleAction({
      id: initialRole.id,
      name,
      description,
    });
    if (res.ok) {
      setSuccess(res.message || "Role updated successfully.");
      setTimeout(() => router.replace("/auth/roles"), 800);
    }
    if (!res.ok) {
      setError(res.message || "Failed to update role.");
    }
    setLoading(false);
  };

  return (
    <Box className="max-w-2xl mx-auto">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Edit Role
      </Typography>

      <Paper elevation={1} className="p-4 sm:p-6">
        <form onSubmit={onSubmit} noValidate>
          <Box display="grid" gap={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              label="Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              inputProps={{ maxLength: 80 }}
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              inputProps={{ maxLength: 500 }}
              multiline
              minRows={3}
              fullWidth
            />

            <Box display="flex" gap={1} sx={{ mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                {loading ? <CircularProgress size={22} /> : "Update"}
              </Button>

              <Button
                component={Link}
                href="/auth/roles"
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
