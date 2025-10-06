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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Link from "next/link";
import { CreateDbConnectionAction } from "@/_actions/dbconnection/create.action";
import { UpdateDbConnectionAction } from "@/_actions/dbconnection/update.action";
import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { TVbdOutRequestDto } from "@/core/application/dtos/vbd.dto";
import { ReadAllVbdSplitterAction } from "@/_actions/vbd-splitter/read-all.action";

export default function DbConnectionClient({
  initial,
}: {
  initial?: TDbConnectionOutRequestDtoWithVbAndUser;
}) {
  const router = useRouter();

  const [vbdSplitters, setVbdSplitters] = React.useState<TVbdOutRequestDto[]>(
    []
  );

  const [name, setName] = React.useState(initial ? initial.name : "");
  const [description, setDescription] = React.useState(
    initial ? initial.description || "" : ""
  );
  const [vbdSplitterId, setVbdSplitterId] = React.useState(
    initial ? initial.id_vbd_splitter || "" : ""
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isUpdate, setIsUpdate] = React.useState(!!initial);

  React.useEffect(() => {
    (async () => {
      try {
        const vbd_splitter_data = await ReadAllVbdSplitterAction();
        setVbdSplitters(vbd_splitter_data.data);
      } catch (error) {
        console.error("Error fetching VBD Splitters:", {
          error: error.message,
        });
        setError("Failed to fetch VBD Splitters.");
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (isUpdate) {
      await onUpdate(e);
    } else {
      await onCreate(e);
    }
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await CreateDbConnectionAction({
        name,
        description,
        id_vbd_splitter: vbdSplitterId,
      });
      console.log("DB Connection created:", res);

      if (res) {
        setSuccess("DB Connection created successfully. Redirecting to list…");
        setTimeout(() => router.replace("/dbconnection"), 800);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to create DB Connection.");
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await UpdateDbConnectionAction(initial!.id, {
        name,
        description,
        id_vbd_splitter: vbdSplitterId,
      });
      console.log("DB Connection updated:", res);

      if (res) {
        setSuccess("DB Connection updated successfully. Redirecting to list…");
        setTimeout(() => router.replace("/dbconnection"), 800);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to update DB Connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-2xl mx-auto">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {isUpdate ? "Update" : "Create"} DB Connection
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

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              inputProps={{ maxLength: 255 }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="vbd-splitter-label">VBD Splitter</InputLabel>
              <Select
                labelId="vbd-splitter-label"
                value={vbdSplitterId}
                onChange={(e) => setVbdSplitterId(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {vbdSplitters && vbdSplitters.length > 0 ? (
                  vbdSplitters.map((splitter) => (
                    <MenuItem key={splitter.id} value={splitter.id}>
                      {splitter.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <em>Loading...</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <Box display="flex" gap={1} sx={{ mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ textTransform: "none" }}
              >
                {loading ? (
                  <CircularProgress size={22} />
                ) : isUpdate ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>

              <Button
                component={Link}
                href="/dbconnection"
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
