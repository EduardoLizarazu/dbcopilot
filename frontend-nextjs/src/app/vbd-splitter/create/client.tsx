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
import { TVbdOutRequestDto } from "@/core/application/dtos/vbd.dto";
import { UpdateVbdSplitterAction } from "@/_actions/vbd-splitter/update.action";

export default function VbdSplitterClient({
  initial,
}: {
  initial?: TVbdOutRequestDto;
}) {
  const router = useRouter();

  const [name, setName] = React.useState(initial ? initial.name : "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (initial) {
      await onUpdate(e);
    } else {
      await onCreate(e);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formattedName = formatName(name); // Apply formatting to the name
    const res = await CreateVbdSplitterAction({ name: formattedName });

    if (res.ok) {
      console.log("VBD Splitter created:", res);
      setSuccess("VBD Splitter created successfully. Redirecting to list…");
      setTimeout(() => router.replace("/vbd-splitter"), 800);
    }
    if (!res.ok) {
      setError(res?.message ?? "Failed to create VBD Splitter.");
    }
    setLoading(false);
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const formattedName = formatName(name); // Apply formatting to the name
    // Assuming UpdateVbdSplitterAction is imported and available
    const res = await UpdateVbdSplitterAction(initial!.id, {
      id: initial!.id,
      name: formattedName,
    });

    if (res.ok) {
      setSuccess("VBD Splitter updated successfully. Redirecting to list…");
      // short delay so user sees feedback, then go back to list
      setTimeout(() => router.replace("/vbd-splitter"), 800);
    }

    if (!res.ok) {
      setError(res?.message ?? "Failed to update VBD Splitter.");
    }
    console.log("VBD Splitter updated:", res);
    setLoading(false);
  };

  // Add a function to format the name
  const formatName = (input: string) => {
    return input.toLowerCase().trim().replace(/\s+/g, "_");
  };

  return (
    <Box className="max-w-2xl mx-auto">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {initial ? "Update" : "Create"} VBD Splitter
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

            {/* Display the formatted name below the input */}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Saved as: <strong>{formatName(name)}</strong>
            </Typography>

            <Box display="flex" gap={1} sx={{ mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                {loading ? (
                  <CircularProgress size={22} />
                ) : initial ? (
                  "Update"
                ) : (
                  "Create"
                )}
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
