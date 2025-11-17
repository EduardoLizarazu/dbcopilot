"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  TSchemaCtxBaseDto,
  TSchemaCtxSchemaDto,
} from "@/core/application/dtos/schemaCtx.dto";
import { CreateSchemaCtxAction } from "@/_actions/schemaCtx/create.action";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { TDbConnectionDto } from "@/core/application/dtos/dbconnection.dto";

export function SchemaCtxClient({ initial }: { initial?: TSchemaCtxBaseDto }) {
  const router = useRouter();
  const [name, setName] = React.useState(initial?.name || "");
  const [description, setDescription] = React.useState(
    initial?.description || ""
  );
  const [dbConnectionIds, setDbConnectionIds] = React.useState(
    initial?.dbConnectionIds || []
  );
  const [dbConnection, setDbConnection] = React.useState<TDbConnectionDto[]>(
    []
  );
  const [schemaCtx, setSchemaCtx] = React.useState<
    TSchemaCtxSchemaDto[] | null
  >(initial?.schemaCtx || null);

  const [loading, setLoading] = React.useState(false);
  const [tableLoading, setTableLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const toggleConn = (id: string) => {
    setDbConnectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onCreate = async () => {
    const res = await CreateSchemaCtxAction({
      name,
      description,
      schemaCtx: schemaCtx || [],
    });
    if (res.ok) {
      setSuccess(res.message ?? "Schema Context created successfully.");
      router.push("/schema-ctx");
    }

    if (!res.ok) {
      setError(res.message || "Failed to create Schema Context.");
    }
    setLoading(false);
  };

  const onUpdate = async () => {
    const res = await UpdateCreateCtxAction({});
    if (res.ok) {
      setSuccess(res.message ?? "Schema Context update successfully.");
      router.push("/schema-ctx");
    }

    if (!res.ok) {
      setError(res.message || "Failed to update Schema Context.");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    if (initial) {
      await onUpdate();
    } else {
      await onCreate();
    }
    setLoading(false);
  };

  const onSearchSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTableLoading(true);
    const res = await SearchSchemaCtxAction(dbConnectionIds);
    if (res.ok) setSchemaCtx(res.data.schemaCtx || []);
    if (!res.ok) setError(res.message || "Failed to search schema context.");
    setTableLoading(false);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {initial ? "Update Schema Context" : "Create Schema Context"}
      </Typography>
      <Paper elevation={1} className="p-4 sm:p-6">
        <form onSubmit={onSubmit} noValidate>
          <Box display="grid" gap={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              label="Name"
              type="name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />

            {/* Connection selection table */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Assign Connections
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small" aria-label="connection selection">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Select</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Database</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Host</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dbConnection.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography color="text.secondary">
                            No connections available.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      dbConnection.map((r) => {
                        const checked = dbConnectionIds.includes(r.id);
                        return (
                          <TableRow key={r.id} hover>
                            <TableCell width={90}>
                              <Checkbox
                                checked={checked}
                                onChange={() => toggleConn(r.id)}
                                inputProps={{
                                  "aria-label": `select role ${r.name}`,
                                }}
                              />
                            </TableCell>
                            <TableCell>{r.name}</TableCell>
                            <TableCell>{r.description || "—"}</TableCell>
                            <TableCell>{r.type || "—"}</TableCell>
                            <TableCell>{r.database || "—"}</TableCell>
                            <TableCell>{r.host || "—"}</TableCell>
                            <TableCell>{r.username || "—"}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-start"
                sx={{ mt: 2 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ textTransform: "none" }}
                >
                  {loading ? <CircularProgress size={22} /> : "Save"}
                </Button>

                <Button
                  component={Link}
                  href="/schema-ctx/"
                  variant="outlined"
                  disabled={loading}
                  sx={{ textTransform: "none" }}
                >
                  Cancel
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ textTransform: "none" }}
                >
                  {loading ? <CircularProgress size={22} /> : "Search Schema"}
                </Button>

                <Button
                  component={Link}
                  href="/schema-ctx/"
                  variant="outlined"
                  disabled={loading}
                  sx={{ textTransform: "none" }}
                >
                  {loading ? (
                    <CircularProgress size={22} />
                  ) : (
                    "Changes detected"
                  )}
                </Button>
              </Stack>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
