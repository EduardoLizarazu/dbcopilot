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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { TDbConnectionDto } from "@/core/application/dtos/dbconnection.dto";
import EditIcon from "@mui/icons-material/Edit";
import { UpdateSchemaCtxAction } from "@/_actions/schemaCtx/update.action";
import { ReadDiffSchemaCtxAction } from "@/_actions/schemaCtx/diff-by-conn-ids.action";

export function SchemaCtxClient({
  initial,
  dbConnections,
}: {
  initial?: TSchemaCtxBaseDto;
  dbConnections: TDbConnectionDto[];
}) {
  const router = useRouter();
  const [name, setName] = React.useState(initial?.name || "");
  const [description, setDescription] = React.useState(
    initial?.description || ""
  );
  const [dbConnectionIds, setDbConnectionIds] = React.useState(
    initial?.dbConnectionIds || []
  );
  const [dbConnection, setDbConnection] = React.useState<TDbConnectionDto[]>(
    dbConnections || []
  );

  //   FIX: NOT KNOW HOW TO DO THE SINGLE SCHEMA EDITOR PART
  const [schemaCtx, setSchemaCtx] = React.useState<
    TSchemaCtxSchemaDto[] | null
  >(initial?.schemaCtx || null);

  const [busy, setBusy] = React.useState<Set<string>>(new Set());

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [openSingleSchemaEditor, setOpenSingleSchemaEditor] =
    React.useState(false);

  const toggleConn = (id: string) => {
    setDbConnectionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const setBusyFlag = (key: string, on: boolean) => {
    setBusy((prev) => {
      const s = new Set(prev);
      if (on) s.add(key);
      else s.delete(key);
      return s;
    });
  };

  const isBusy = (key: string) => busy.has(key);

  const onCreate = async () => {
    setBusyFlag("submit", true);
    try {
      const res = await CreateSchemaCtxAction({
        name,
        description,
        dbConnectionIds,
        schemaCtx: schemaCtx || [],
      });
      if (res.ok) {
        setSuccess(res.message ?? "Schema Context created successfully.");
        router.push("/schema-ctx");
      }

      if (!res.ok) {
        setError(res.message || "Failed to create Schema Context.");
      }
    } finally {
      setBusyFlag("submit", false);
    }
  };

  const onUpdate = async () => {
    setBusyFlag("submit", true);
    try {
      const res = await UpdateSchemaCtxAction(initial?.id, {
        id: initial?.id,
        name,
        description,
        dbConnectionIds,
        schemaCtx: schemaCtx || [],
      });
      if (res.ok) {
        setSuccess(res.message ?? "Schema Context update successfully.");
        router.push("/schema-ctx");
      }

      if (!res.ok) {
        setError(res.message || "Failed to update Schema Context.");
      }
    } finally {
      setBusyFlag("submit", false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (initial) {
      //   await onUpdate();
    } else {
      //   await onCreate();
    }
  };

  const onSearchDiffSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusyFlag("table", true);
    try {
      // NEED TO FIX THIS ON THE SCHEMA ID CREATION FIRST
      //   const res = await ReadDiffSchemaCtxAction({
      //     schemaCtxId: initial?.id || null,
      //     connIds: dbConnectionIds,
      //   });
      //   if (res.ok) setSchemaCtx(res.data || []);
      //   if (!res.ok) setError(res.message || "Failed to search schema context.");
    } finally {
      setBusyFlag("table", false);
    }
  };

  const onProfile = async () => {
    setError(null);
    setSuccess(null);
    setBusyFlag("profile", true);
    // const res = await ProfileSchemaCtxAction(dbConnectionIds);
    const res = {
      ok: false,
      message: "Not implemented",
      data: null,
    };
    try {
      if (res.ok) setSchemaCtx(res.data.schemaCtx || []);
      if (!res.ok) setError(res.message || "Failed to profile schema context.");
    } finally {
      setBusyFlag("profile", false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {initial ? "Update Schema Context" : "Create Schema Context"}
      </Typography>
      <Paper elevation={1} className="p-4 sm:p-6">
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
            multiline
            minRows={4}
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
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
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
                                "aria-label": `select connection ${r.name}`,
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
          {/* Actions buttons */}
          <Box>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={isBusy("submit")}
                sx={{ textTransform: "none" }}
                onClick={onSubmit}
                loading={isBusy("submit")}
              >
                Save
              </Button>

              <Button
                component={Link}
                href="/schema-ctx/"
                variant="outlined"
                disabled={isBusy("submit")}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-start"
              sx={{ mt: 2 }}
            >
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                disabled={isBusy("table")}
                loading={isBusy("table")}
                sx={{ textTransform: "none" }}
                onClick={onSearchDiffSchema}
              >
                Search Schema
              </Button>
            </Stack>
          </Box>
          {/* Table Schema */}
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="schema context table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Schema</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Table</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Column</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schemaCtx && schemaCtx.length > 0 ? (
                  schemaCtx.map((schema) =>
                    schema.tables.map((table) =>
                      table.columns.map((col) => (
                        <TableRow
                          key={`${schema.id}-${table.id}-${col.id}`}
                          hover
                        >
                          <TableCell>{schema.name}</TableCell>
                          <TableCell>{table.name || "—"}</TableCell>
                          <TableCell>{col.name || "—"}</TableCell>
                          <TableCell>{col.dataType || "—"}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="edit">
                              <IconButton
                                aria-label="Edit schema context"
                                size="small"
                                onClick={() => {
                                  setOpenSingleSchemaEditor(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        No schema rows available.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      <Dialog open={openSingleSchemaEditor} maxWidth="sm" fullWidth={true}>
        <DialogTitle>Single Schema Editor</DialogTitle>
        <DialogContent dividers={true}>
          <Box display="grid" gap={2}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Schema
            </Typography>
            <TextField
              label="Schema Name"
              type="schema-name"
              disabled={true}
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
            />
            <TextField
              label="Schema Aliases"
              type="schema-aliases"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
            />
            <TextField
              label="Schema Description"
              type="schema-description"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
            />

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Table
            </Typography>
            <TextField
              label="Table Name"
              type="table-name"
              value={""}
              disabled={true}
              required
              onChange={(e) => {}}
              fullWidth
            />
            <TextField
              label="Table Description"
              type="table-description"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
            />
            <TextField
              label="Table aliases"
              type="table-aliases"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
            />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Column
            </Typography>
            <TextField
              label="Column name"
              type="column-name"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
              disabled={true}
            />
            <TextField
              label="Column aliases"
              type="column-aliases"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
            />
            <TextField
              label="Column description"
              type="column-description"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
            />
            <TextField
              label="Column type"
              type="column-type"
              value={""}
              required
              onChange={(e) => {}}
              fullWidth
              disabled={true}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            color="error"
            disabled={isBusy("submit")}
            sx={{ textTransform: "none" }}
            onClick={() => setOpenSingleSchemaEditor(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
