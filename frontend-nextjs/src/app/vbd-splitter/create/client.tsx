"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { CreateVbdSplitterAction } from "@/_actions/vbd-splitter/create.action";

export default function CreateVbdSplitterClient() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await CreateVbdSplitterAction({ name });
      console.log("VBD Splitter created:", res);

      if (res) {
        setSuccess("VBD Splitter created successfully. Redirecting to list…");
        // short delay so user sees feedback, then go back to list
        setTimeout(() => router.replace("/vbd-splitter"), 800);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to create VBD Splitter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-2xl mx-auto">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Create VBD Splitter
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
              inputProps={{ maxLength: 100 }}
              fullWidth
            />

            <Box display="flex" gap={1} sx={{ mt: 1 }}>
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
                href="/vbd-splitter"
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
