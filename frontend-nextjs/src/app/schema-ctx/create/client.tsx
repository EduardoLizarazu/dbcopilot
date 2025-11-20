"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  TSchemaCtxBaseDto,
  TSchemaCtxDiffSchemaDto,
  TSchemaCtxSchemaDto,
  TSchemaCtxColumnProfileDto,
  TSchemaCtxSimpleSchemaDto,
  SchemaCtxDiffStatus,
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
  Grid2 as Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
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
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DoneIcon from "@mui/icons-material/Done";
import { UpdateSchemaCtxAction } from "@/_actions/schemaCtx/update.action";
import { ReadDiffSchemaCtxAction } from "@/_actions/schemaCtx/diff-by-conn-ids.action";
import { ReadNewSchemaCtxAction } from "@/_actions/schemaCtx/new-by-conn-ids.action";
import { InfoProfileExtractorAction } from "@/_actions/nlq-qa-info/profile-extractor.action";
import { GenSchemaCtxAction } from "@/_actions/gen/gen-schema-ctx.action";

const steps = ["Schema Differences", "Knowledge source", "Confirm"];

enum SchemaCtxDiffLevel {
  SCHEMA = "SCHEMA",
  TABLE = "TABLE",
  COLUMN = "COLUMN",
  DATATYPE = "DATATYPE",
}

export function SchemaCtxClient({
  initial,
  dbConnections,
}: {
  initial?: TSchemaCtxBaseDto;
  dbConnections: TDbConnectionDto[];
}) {
  const router = useRouter();

  // STEPPER
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  // REGULAR FIELDS
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
  const [schemaCtx, setSchemaCtx] = React.useState<
    TSchemaCtxSchemaDto[] | null
  >(initial?.schemaCtx || null);

  const [schemaCtxDiff, setSchemaCtxDiff] = React.useState<
    TSchemaCtxDiffSchemaDto[] | null
  >(null);

  // INTERNAL STATES
  const [busy, setBusy] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [openSingleSchemaEditor, setOpenSingleSchemaEditor] =
    React.useState(false);

  const [openDiffEditor, setOpenDiffEditor] = React.useState(false);
  // ================ SINGLE SCHEMA EDITOR STATES =================
  // Single-item selection state (which schema/table/column we're editing)
  const [selectedSchemaId, setSelectedSchemaId] = React.useState<string | null>(
    null
  );
  const [selectedTableId, setSelectedTableId] = React.useState<string | null>(
    null
  );
  const [selectedColumnId, setSelectedColumnId] = React.useState<string | null>(
    null
  );

  // Fields shown in the single editor dialog
  const [schemaName, setSchemaName] = React.useState("");
  const [schemaDescription, setSchemaDescription] = React.useState("");
  const [schemaAliases, setSchemaAliases] = React.useState<string[]>([]);

  const [tableName, setTableName] = React.useState("");
  const [tableDescription, setTableDescription] = React.useState("");
  const [tableAliases, setTableAliases] = React.useState<string[]>([]);

  const [columnName, setColumnName] = React.useState("");
  const [columnDescription, setColumnDescription] = React.useState("");
  const [columnType, setColumnType] = React.useState("");
  const [columnAliases, setColumnAliases] = React.useState<string[]>([]);
  // profile for the selected column (may be null)
  const [columnProfile, setColumnProfile] =
    React.useState<TSchemaCtxColumnProfileDto | null>(null);
  // sample unique top (limit) input
  const [sampleTop, setSampleTop] = React.useState<number>(10);

  const resetSingleEditorState = () => {
    setSelectedSchemaId(null);
    setSelectedTableId(null);
    setSelectedColumnId(null);
    setSchemaName("");
    setSchemaDescription("");
    setSchemaAliases([]);
    setTableName("");
    setTableDescription("");
    setTableAliases([]);
    setColumnName("");
    setColumnDescription("");
    setColumnType("");
    setColumnAliases([]);
  };

  const openSingleEditor = (
    schemaId: string,
    tableId: string,
    columnId: string
  ) => {
    if (!schemaCtx) return;
    const s = schemaCtx.find((x) => x.id === schemaId);
    if (!s) return;
    const t = s.tables.find((x) => x.id === tableId);
    if (!t) return;
    const c = t.columns.find((x) => x.id === columnId);
    if (!c) return;

    setSelectedSchemaId(schemaId);
    setSelectedTableId(tableId);
    setSelectedColumnId(columnId);

    setSchemaName(s.name);
    setSchemaDescription(s.description || "");
    setSchemaAliases(Array.isArray(s.aliases) ? [...s.aliases] : []);

    setTableName(t.name);
    setTableDescription(t.description || "");
    setTableAliases(Array.isArray(t.aliases) ? [...t.aliases] : []);

    setColumnName(c.name);
    setColumnDescription(c.description || "");
    setColumnType(c.dataType || "");
    setColumnAliases(Array.isArray(c.aliases) ? [...c.aliases] : []);
    // initialize profile from column if present
    setColumnProfile(
      c.profile ? (c.profile as TSchemaCtxColumnProfileDto) : null
    );

    setOpenSingleSchemaEditor(true);
  };

  const saveSingleEditor = () => {
    if (
      !schemaCtx ||
      !selectedSchemaId ||
      !selectedTableId ||
      !selectedColumnId
    )
      return;
    const updated = schemaCtx.map((s) => {
      if (s.id !== selectedSchemaId) return s;
      return {
        ...s,
        description: schemaDescription,
        aliases: schemaAliases,
        tables: s.tables.map((t) => {
          if (t.id !== selectedTableId) return t;
          return {
            ...t,
            description: tableDescription,
            aliases: tableAliases,
            columns: t.columns.map((col) => {
              if (col.id !== selectedColumnId) return col;
              return {
                ...col,
                description: columnDescription,
                aliases: columnAliases,
                // persist profile if present (can be null)
                profile: columnProfile ?? col.profile,
              };
            }),
          };
        }),
      };
    });
    setSchemaCtx(updated);
    setOpenSingleSchemaEditor(false);
    resetSingleEditorState();
  };
  // ===========================================================

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

  const isStepOptional = (step: number) => {
    return step === 1;
  };
  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };
  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const onCreate = async () => {
    setBusyFlag("submit", true);
    try {
      const res = await CreateSchemaCtxAction({
        name,
        description,
        dbConnectionIds,
        schemaCtx:
          schemaCtx?.map((s) => {
            return {
              id: s.id.toString() || "",
              name: s.name.toString() || "",
              description: s.description?.toString() || "",
              aliases: s.aliases?.map((a) => a.toString()) || [],
              tables:
                s.tables?.map((t) => {
                  return {
                    id: t.id.toString() || "",
                    name: t.name.toString() || "",
                    description: t.description?.toString() || "",
                    aliases: t.aliases?.map((a) => a.toString()) || [],
                    columns:
                      t.columns?.map((col) => {
                        return {
                          id: col.id.toString() || "",
                          name: col.name.toString() || "",
                          description: col.description?.toString() || "",
                          aliases: col.aliases?.map((a) => a.toString()) || [],
                          dataType: col.dataType.toString() || "",
                          profile: {
                            maxValue: col.profile?.maxValue?.toString() || "",
                            minValue: col.profile?.minValue?.toString() || "",
                            countNulls: col.profile?.countNulls || 0,
                            countUnique: col.profile?.countUnique || 0,
                            sampleUnique:
                              col.profile?.sampleUnique?.map((s) =>
                                s.toString()
                              ) || [],
                          },
                        };
                      }) || [],
                  };
                }) || [],
            };
          }) || [],
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
      await onCreate();
    }
  };

  const onSearchDiffSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusyFlag("table", true);
    setBusyFlag("table-diff", false);
    setSchemaCtxDiff(null);
    try {
      let res = null;
      if (initial && initial?.dbConnectionIds?.length > 0) {
        res = await ReadDiffSchemaCtxAction({
          schemaCtxId: initial?.id || null,
          connIds: dbConnectionIds,
        });
        if (res.ok) {
          setSchemaCtxDiff(res.data?.diffSchemas || []);
          console.log("diff schemas", res.data?.diffSchemas || []);
          setOpenDiffEditor(true);
          setBusyFlag("table-diff", true);
        }
      } else {
        res = await ReadNewSchemaCtxAction({
          connIds: dbConnectionIds,
        });
        if (res.ok) setSchemaCtx(res.data || []);
      }

      if (!res.ok) setError(res.message || "Failed to search schema context.");
    } finally {
      setBusyFlag("table", false);
      setBusyFlag("table-diff", false);
    }
  };
  // select the id of the field in the diff schema that I want to update (new)
  const [updateNewField, setUpdateNewField] = React.useState<{
    id: string;
    name: string;
    level: SchemaCtxDiffLevel;
  } | null>(null);
  const [displayOldFields, setDisplayOldFields] = React.useState<
    | {
        id: string;
        name: string;
        extraName?: string;
      }[]
    | null
  >(null);
  const onSearchDiffSchemaCtxFieldsToUpdate = (
    id: string,
    name: string,
    level: SchemaCtxDiffLevel
  ) => {
    console.log("id", id);
    console.log("level", level);
    setUpdateNewField({ id, name, level });
    const displayOldFields = schemaCtxDiff?.flatMap((schema) =>
      schema.tables.flatMap((table) =>
        table.columns.map((col) => {
          if (
            level === SchemaCtxDiffLevel.SCHEMA &&
            schema.id !== id &&
            schema.status === SchemaCtxDiffStatus.DELETE
          ) {
            return {
              id: schema.id,
              name: schema.name,
            };
          } else if (
            level === SchemaCtxDiffLevel.TABLE &&
            table.id !== id &&
            table.status === SchemaCtxDiffStatus.DELETE
          ) {
            return {
              id: table.id,
              name: table.name,
            };
          } else if (
            level === SchemaCtxDiffLevel.COLUMN &&
            col.id !== id &&
            col.status === SchemaCtxDiffStatus.DELETE
          ) {
            return {
              id: col.id,
              name: col.name,
            };
          }
          return null;
        })
      )
    );
    const displayOldFieldsFormatted = displayOldFields
      .filter(Boolean) // quita null
      .filter(
        (item, index, self) =>
          index === self.findIndex((other) => other.id === item.id)
      );
    console.log("displayOldFields", displayOldFieldsFormatted);

    setDisplayOldFields(displayOldFieldsFormatted || null);
  };

  // selected the id of the field in the diff which is the previous one (old)
  const onUpdateSchemaCtxFieldByOldField = (oldId: string, oldName: string) => {
    const newId = updateNewField?.id;
    const newName = updateNewField?.name;
    const level = updateNewField?.level;

    setSchemaCtxDiff((prev) => {
      return prev.map((schema) => {
        if (schema.id === oldId) {
          return {
            ...schema,
            newId: newId,
            newName: newName,
            oldId: "",
            oldName: "",
            status: SchemaCtxDiffStatus.UPDATE,
          };
        } else if (schema.id === newId) {
          return {
            ...schema,
            oldId: oldId,
            oldName: oldName,
            newId: "",
            newName: "",
            status: SchemaCtxDiffStatus.UPDATE,
          };
        }
        return {
          ...schema,
          tables: schema.tables.map((table) => {
            if (table.id === oldId) {
              return {
                ...table,
                newId: newId,
                newName: newName,
                oldId: "",
                oldName: "",
                status: SchemaCtxDiffStatus.UPDATE,
              };
            } else if (table.id === newId) {
              return {
                ...table,
                oldId: oldId,
                oldName: oldName,
                newId: "",
                newName: "",
                status: SchemaCtxDiffStatus.UPDATE,
              };
            }
            return {
              ...table,
              columns: table.columns.map((col) => {
                if (col.id === oldId) {
                  return {
                    ...col,
                    newId: newId,
                    newName: newName,
                    oldId: "",
                    oldName: "",
                    status: SchemaCtxDiffStatus.UPDATE,
                  };
                } else if (col.id === newId) {
                  return {
                    ...col,
                    oldId: oldId,
                    oldName: oldName,
                    newId: "",
                    newName: "",
                    status: SchemaCtxDiffStatus.UPDATE,
                  };
                }
                return col;
              }),
            };
          }),
        };
      });
    });

    setDisplayOldFields(null);
  };

  const onProfile = async () => {
    setError(null);
    setSuccess(null);
    setBusyFlag("profile", true);
    try {
      // build requested schema info. If single-editor open, use selected values
      const schemaInfo = {
        schemaName: selectedSchemaId ? schemaName : "",
        tableName: selectedTableId ? tableName : "",
        columnName: selectedColumnId ? columnName : "",
        dataType: selectedColumnId ? columnType : "",
        top: sampleTop || 1,
      };
      console.log("schemaInfo", schemaInfo);

      const res = await InfoProfileExtractorAction({
        connectionIds: dbConnectionIds,
        schema: schemaInfo,
      });
      console.log("profile extractor response", res);

      if (res.ok) {
        setColumnProfile(res.data);
      }

      if (!res.ok) setError(res.message || "Failed to profile schema context.");
    } finally {
      setBusyFlag("profile", false);
    }
  };

  const onGenSchemaCtx = async () => {
    setError(null);
    setSuccess(null);
    setBusyFlag("genSchemaCtx", true);
    try {
      const schemaInfo: TSchemaCtxSimpleSchemaDto = {
        id: selectedSchemaId || "",
        name: schemaName.toString() || "",
        description: schemaDescription.toString() || "",
        aliases: schemaAliases.map((i) => i.toString()) || [],
        table: {
          id: selectedTableId || "",
          name: tableName.toString() || "",
          description: tableDescription.toString() || "",
          aliases: tableAliases.map((i) => i.toString()) || [],
          column: {
            id: selectedColumnId || "",
            name: columnName.toString() || "",
            description: columnDescription.toString() || "",
            aliases: columnAliases.map((i) => i.toString()) || [],
            dataType: columnType.toString() || "",
            profile: {
              maxValue: columnProfile?.maxValue.toString() || "",
              minValue: columnProfile?.minValue.toString() || "",
              countNulls: columnProfile?.countNulls || 0,
              countUnique: columnProfile?.countUnique || 0,
              sampleUnique:
                columnProfile?.sampleUnique.map((i) => i.toString()) || [],
            },
          },
        },
      };
      const res = await GenSchemaCtxAction(schemaInfo);

      if (res.ok) {
        setSchemaDescription(res.data.description.toString() || "");
        setSchemaAliases(res.data.aliases.map((i) => i.toString()) || []);
        setTableDescription(res.data.table?.description.toString() || "");
        setTableAliases(res.data.table?.aliases.map((i) => i.toString()) || []);
        setColumnDescription(
          res.data.table?.column?.description.toString() || ""
        );
        setColumnAliases(
          res.data.table?.column?.aliases.map((i) => i.toString()) || []
        );
      }

      if (!res.ok)
        setError(res.message || "Failed to generate schema context.");
    } finally {
      setBusyFlag("genSchemaCtx", false);
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
                {!(initial && initial?.dbConnectionIds?.length > 0)
                  ? "Load schema"
                  : "Load & update knowledge"}
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
                                onClick={() =>
                                  openSingleEditor(schema.id, table.id, col.id)
                                }
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
      {/* SINGLE SCHEMA EDITOR DIALOG */}
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
              value={schemaName}
              required
              onChange={(e) => setSchemaName(e.target.value)}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="subtitle2">Schema Aliases</Typography>
                <Button
                  size="small"
                  onClick={() => setSchemaAliases((s) => [...s, ""])}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              {schemaAliases.length === 0 && (
                <Typography color="text.secondary">
                  No aliases defined.
                </Typography>
              )}
              {schemaAliases.map((alias, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    label={`Alias ${idx + 1}`}
                    value={alias}
                    onChange={(e) =>
                      setSchemaAliases((s) =>
                        s.map((v, i) => (i === idx ? e.target.value : v))
                      )
                    }
                    fullWidth
                    size="small"
                  />
                  <IconButton
                    aria-label="remove-alias"
                    size="small"
                    onClick={() =>
                      setSchemaAliases((s) => s.filter((_, i) => i !== idx))
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <TextField
              label="Schema Description"
              type="schema-description"
              multiline
              minRows={2}
              value={schemaDescription}
              required
              onChange={(e) => setSchemaDescription(e.target.value)}
              fullWidth
            />

            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Table
            </Typography>
            <TextField
              label="Table Name"
              type="table-name"
              value={tableName}
              disabled={true}
              required
              onChange={(e) => setTableName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Table Description"
              type="table-description"
              value={tableDescription}
              multiline
              minRows={2}
              required
              onChange={(e) => setTableDescription(e.target.value)}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="subtitle2">Table Aliases</Typography>
                <Button
                  size="small"
                  onClick={() => setTableAliases((s) => [...s, ""])}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              {tableAliases.length === 0 && (
                <Typography color="text.secondary">
                  No aliases defined.
                </Typography>
              )}
              {tableAliases.map((alias, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    label={`Alias ${idx + 1}`}
                    value={alias}
                    onChange={(e) =>
                      setTableAliases((s) =>
                        s.map((v, i) => (i === idx ? e.target.value : v))
                      )
                    }
                    fullWidth
                    size="small"
                  />
                  <IconButton
                    aria-label="remove-alias"
                    size="small"
                    onClick={() =>
                      setTableAliases((s) => s.filter((_, i) => i !== idx))
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Column
            </Typography>
            <TextField
              label="Column name"
              type="column-name"
              value={columnName}
              required
              onChange={(e) => setColumnName(e.target.value)}
              fullWidth
              disabled={true}
            />
            <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="subtitle2">Column Aliases</Typography>
                <Button
                  size="small"
                  onClick={() => setColumnAliases((s) => [...s, ""])}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              {columnAliases.length === 0 && (
                <Typography color="text.secondary">
                  No aliases defined.
                </Typography>
              )}
              {columnAliases.map((alias, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    label={`Alias ${idx + 1}`}
                    value={alias}
                    onChange={(e) =>
                      setColumnAliases((s) =>
                        s.map((v, i) => (i === idx ? e.target.value : v))
                      )
                    }
                    fullWidth
                    size="small"
                  />
                  <IconButton
                    aria-label="remove-alias"
                    size="small"
                    onClick={() =>
                      setColumnAliases((s) => s.filter((_, i) => i !== idx))
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <TextField
              label="Column description"
              type="column-description"
              value={columnDescription}
              multiline
              minRows={2}
              required
              onChange={(e) => setColumnDescription(e.target.value)}
              fullWidth
            />
            <TextField
              label="Column type"
              type="column-type"
              value={columnType}
              required
              onChange={(e) => setColumnType(e.target.value)}
              fullWidth
              disabled={true}
            />
            {/* Profile section for the selected column */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Profile
              </Typography>

              <TextField
                label="Sample top"
                type="number"
                value={sampleTop}
                onChange={(e) =>
                  setSampleTop(
                    Math.max(1, Math.min(50, Number(e.target.value || 0)))
                  )
                }
                inputProps={{ min: 1, max: 50 }}
                helperText="Limit for sample unique (min 1, max 50)"
                size="small"
                sx={{ mb: 1, width: 200 }}
              />

              {columnProfile === null ? (
                <Alert severity="warning">
                  No profile data. Click Profile to fetch.
                </Alert>
              ) : (
                <Box display="grid" gap={1}>
                  <TextField
                    label="Max Value"
                    value={columnProfile?.maxValue || ""}
                    onChange={(e) =>
                      setColumnProfile(
                        (p) =>
                          ({
                            ...(p ?? {
                              maxValue: "",
                              minValue: "",
                              countNulls: 0,
                              countUnique: 0,
                              sampleUnique: [],
                            }),
                            maxValue: e.target.value,
                          }) as TSchemaCtxColumnProfileDto
                      )
                    }
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Min Value"
                    value={columnProfile?.minValue || ""}
                    onChange={(e) =>
                      setColumnProfile(
                        (p) =>
                          ({
                            ...(p ?? {
                              maxValue: "",
                              minValue: "",
                              countNulls: 0,
                              countUnique: 0,
                              sampleUnique: [],
                            }),
                            minValue: e.target.value,
                          }) as TSchemaCtxColumnProfileDto
                      )
                    }
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Count Nulls"
                    type="number"
                    value={columnProfile?.countNulls ?? 0}
                    onChange={(e) =>
                      setColumnProfile(
                        (p) =>
                          ({
                            ...(p ?? {
                              maxValue: "",
                              minValue: "",
                              countNulls: 0,
                              countUnique: 0,
                              sampleUnique: [],
                            }),
                            countNulls: Number(e.target.value || 0),
                          }) as TSchemaCtxColumnProfileDto
                      )
                    }
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Count Unique"
                    type="number"
                    value={columnProfile?.countUnique ?? 0}
                    onChange={(e) =>
                      setColumnProfile(
                        (p) =>
                          ({
                            ...(p ?? {
                              maxValue: "",
                              minValue: "",
                              countNulls: 0,
                              countUnique: 0,
                              sampleUnique: [],
                            }),
                            countUnique: Number(e.target.value || 0),
                          }) as TSchemaCtxColumnProfileDto
                      )
                    }
                    fullWidth
                    size="small"
                  />

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="subtitle2">Sample Unique</Typography>
                    <Button
                      size="small"
                      onClick={() =>
                        setColumnProfile(
                          (p) =>
                            ({
                              ...(p ?? {
                                maxValue: "",
                                minValue: "",
                                countNulls: 0,
                                countUnique: 0,
                                sampleUnique: [],
                              }),
                              sampleUnique: [
                                ...((p?.sampleUnique as string[]) || []),
                                "",
                              ],
                            }) as TSchemaCtxColumnProfileDto
                        )
                      }
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Box>

                  {!(columnProfile?.sampleUnique || []).length && (
                    <Typography color="text.secondary">
                      No samples defined.
                    </Typography>
                  )}
                  {(columnProfile?.sampleUnique || []).map((alias, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        label={`Sample ${idx + 1}`}
                        value={alias}
                        onChange={(e) =>
                          setColumnProfile(
                            (p) =>
                              ({
                                ...(p ?? {
                                  maxValue: "",
                                  minValue: "",
                                  countNulls: 0,
                                  countUnique: 0,
                                  sampleUnique: [],
                                }),
                                sampleUnique: (p?.sampleUnique || []).map(
                                  (v, i) => (i === idx ? e.target.value : v)
                                ),
                              }) as TSchemaCtxColumnProfileDto
                          )
                        }
                        fullWidth
                        size="small"
                      />
                      <IconButton
                        aria-label="remove-sample"
                        size="small"
                        onClick={() =>
                          setColumnProfile(
                            (p) =>
                              ({
                                ...(p ?? {
                                  maxValue: "",
                                  minValue: "",
                                  countNulls: 0,
                                  countUnique: 0,
                                  sampleUnique: [],
                                }),
                                sampleUnique: (p?.sampleUnique || []).filter(
                                  (_, i) => i !== idx
                                ),
                              }) as TSchemaCtxColumnProfileDto
                          )
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: "100%", justifyContent: "space-between" }}
          >
            <Box>
              <Button
                type="button"
                variant="contained"
                disabled={isBusy("submit")}
                sx={{ textTransform: "none" }}
                onClick={() => saveSingleEditor()}
              >
                Save
              </Button>
              <Button
                type="button"
                color="secondary"
                variant="contained"
                disabled={isBusy("profile")}
                loading={isBusy("profile")}
                sx={{ textTransform: "none", ml: 1 }}
                onClick={() => onProfile()}
              >
                Profile
              </Button>
              <Button
                type="button"
                color="secondary"
                variant="contained"
                disabled={isBusy("genSchemaCtx")}
                loading={isBusy("genSchemaCtx")}
                sx={{ textTransform: "none", ml: 1 }}
                onClick={() => onGenSchemaCtx()}
              >
                Generate Schema Context
              </Button>
            </Box>
            <Box>
              <Button
                type="button"
                variant="outlined"
                color="error"
                disabled={isBusy("submit")}
                sx={{ textTransform: "none" }}
                onClick={() => {
                  setOpenSingleSchemaEditor(false);
                  resetSingleEditorState();
                }}
              >
                Close
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>
      {/* DIFF DIALOG */}
      <Dialog
        open={openDiffEditor}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { width: "70%", maxWidth: "none", overflow: "hidden" },
        }}
      >
        <DialogTitle>
          <Box sx={{ flex: "0 0 auto", overflow: "hidden" }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps: { completed?: boolean } = {};
                const labelProps: {
                  optional?: React.ReactNode;
                } = {};
                if (isStepOptional(index)) {
                  labelProps.optional = (
                    <Typography variant="caption">Optional</Typography>
                  );
                }
                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
        </DialogTitle>
        <DialogContent
          dividers={true}
          sx={{
            height: "60vh",
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              {activeStep === 3 ? (
                <React.Fragment>
                  <Typography sx={{ mt: 2, mb: 1 }}>
                    All steps completed - you&apos;re finished
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <Button onClick={handleReset}>Reset</Button>
                  </Box>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {activeStep === 0 && (
                    <>
                      <Box display="grid" gap={2} sx={{ height: "100%" }}>
                        <Grid
                          container
                          spacing={3}
                          sx={{ height: "100%", minHeight: 0 }}
                        >
                          <Grid
                            size={8}
                            sx={{
                              height: "100%",
                              minHeight: 0,
                              overflow: "auto",
                            }}
                          >
                            {/* DIFF SCHEMA TABLE */}
                            <TableContainer component={Paper} elevation={0}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      Title
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      Name
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {schemaCtxDiff === null ||
                                  schemaCtxDiff.length === 0 ? (
                                    <>
                                      <TableRow>
                                        <TableCell colSpan={3}>
                                          <Typography color="text.secondary">
                                            No schema differences found.
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    </>
                                  ) : (
                                    <>
                                      {schemaCtxDiff.map((diff) => (
                                        <React.Fragment key={diff.id}>
                                          <TableRow key={diff.id} hover>
                                            <TableCell>Schema</TableCell>
                                            <TableCell>
                                              {diff.name}
                                              {diff.oldName &&
                                                ` → (old) ${diff.oldName}`}
                                              {diff.newName &&
                                                ` → (new) ${diff.newName}`}
                                            </TableCell>
                                            <TableCell>
                                              {diff.status ===
                                                SchemaCtxDiffStatus.UN_CHANGE &&
                                                "-"}
                                              {diff.status !==
                                                SchemaCtxDiffStatus.UN_CHANGE &&
                                                diff.status !==
                                                  SchemaCtxDiffStatus.DELETE && (
                                                  <Tooltip title="update">
                                                    <IconButton
                                                      aria-label="update-schema"
                                                      size="small"
                                                      onClick={() =>
                                                        onSearchDiffSchemaCtxFieldsToUpdate(
                                                          diff.id,
                                                          diff.name,
                                                          SchemaCtxDiffLevel.SCHEMA
                                                        )
                                                      }
                                                      color={
                                                        diff.status ===
                                                        SchemaCtxDiffStatus.UPDATE
                                                          ? "secondary"
                                                          : "inherit"
                                                      }
                                                    >
                                                      <EditIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                )}
                                              {diff.status ===
                                                SchemaCtxDiffStatus.NEW && (
                                                <Tooltip title="new">
                                                  <IconButton
                                                    aria-label="new-schema"
                                                    size="small"
                                                    color={
                                                      diff.status ===
                                                      SchemaCtxDiffStatus.NEW
                                                        ? "success"
                                                        : "inherit"
                                                    }
                                                  >
                                                    <AddIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              )}
                                              {diff.status ===
                                                SchemaCtxDiffStatus.DELETE && (
                                                <>
                                                  <Tooltip title="delete">
                                                    <IconButton
                                                      aria-label="delete-schema"
                                                      size="small"
                                                      color={
                                                        diff.status ===
                                                        SchemaCtxDiffStatus.DELETE
                                                          ? "error"
                                                          : "inherit"
                                                      }
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  </Tooltip>
                                                </>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                          {diff.tables.map((table) => (
                                            <React.Fragment
                                              key={`${diff.id}-${table.id}`}
                                            >
                                              <TableRow
                                                key={`${diff.id}-${table.id}`}
                                                hover
                                              >
                                                <TableCell sx={{ pl: 4 }}>
                                                  Table
                                                </TableCell>
                                                <TableCell>
                                                  {table.name}
                                                  {table.oldName &&
                                                    ` → (old) ${table.oldName}`}
                                                  {table.newName &&
                                                    ` → (new) ${table.newName}`}
                                                </TableCell>
                                                <TableCell>
                                                  {table.status ===
                                                    SchemaCtxDiffStatus.UN_CHANGE &&
                                                    "-"}
                                                  {table.status !==
                                                    SchemaCtxDiffStatus.UN_CHANGE &&
                                                    table.status !==
                                                      SchemaCtxDiffStatus.DELETE && (
                                                      <Tooltip title="update">
                                                        <IconButton
                                                          aria-label="update-schema"
                                                          size="small"
                                                          onClick={() =>
                                                            onSearchDiffSchemaCtxFieldsToUpdate(
                                                              table.id,
                                                              table.name,
                                                              SchemaCtxDiffLevel.TABLE
                                                            )
                                                          }
                                                          color={
                                                            table.status ===
                                                            SchemaCtxDiffStatus.UPDATE
                                                              ? "secondary"
                                                              : "inherit"
                                                          }
                                                        >
                                                          <EditIcon fontSize="small" />
                                                        </IconButton>
                                                      </Tooltip>
                                                    )}
                                                  {(table.status ===
                                                    SchemaCtxDiffStatus.NEW ||
                                                    table.oldName) && (
                                                    <Tooltip title="new">
                                                      <IconButton
                                                        aria-label="new-schema"
                                                        size="small"
                                                        color={
                                                          Number(
                                                            table.status
                                                          ) ===
                                                          SchemaCtxDiffStatus.NEW
                                                            ? "success"
                                                            : "inherit"
                                                        }
                                                      >
                                                        <AddIcon fontSize="small" />
                                                      </IconButton>
                                                    </Tooltip>
                                                  )}
                                                  {table.status ===
                                                    SchemaCtxDiffStatus.DELETE && (
                                                    <>
                                                      <Tooltip title="delete">
                                                        <IconButton
                                                          aria-label="delete-schema"
                                                          size="small"
                                                          color={
                                                            table.status ===
                                                            SchemaCtxDiffStatus.DELETE
                                                              ? "error"
                                                              : "inherit"
                                                          }
                                                        >
                                                          <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                      </Tooltip>
                                                    </>
                                                  )}
                                                </TableCell>
                                              </TableRow>
                                              {table.columns.map((col) => (
                                                <React.Fragment
                                                  key={`${diff.id}-${table.id}-${col.id}`}
                                                >
                                                  <TableRow
                                                    key={`${diff.id}-${table.id}-${col.id}`}
                                                    hover
                                                  >
                                                    <TableCell sx={{ pl: 8 }}>
                                                      Column
                                                    </TableCell>
                                                    <TableCell>
                                                      {col.name}
                                                      {col.oldName &&
                                                        ` → (old) ${col.oldName}`}
                                                      {col.newName &&
                                                        ` → (new) ${col.newName}`}
                                                    </TableCell>
                                                    <TableCell>
                                                      {col.status ===
                                                        SchemaCtxDiffStatus.UN_CHANGE &&
                                                        "-"}
                                                      {col.status !==
                                                        SchemaCtxDiffStatus.UN_CHANGE &&
                                                        col.status !==
                                                          SchemaCtxDiffStatus.DELETE && (
                                                          <Tooltip title="update">
                                                            <IconButton
                                                              aria-label="update-schema"
                                                              size="small"
                                                              onClick={() =>
                                                                onSearchDiffSchemaCtxFieldsToUpdate(
                                                                  col.id,
                                                                  col.name,
                                                                  SchemaCtxDiffLevel.COLUMN
                                                                )
                                                              }
                                                              color={
                                                                col.status ===
                                                                SchemaCtxDiffStatus.UPDATE
                                                                  ? "secondary"
                                                                  : "inherit"
                                                              }
                                                            >
                                                              <EditIcon fontSize="small" />
                                                            </IconButton>
                                                          </Tooltip>
                                                        )}
                                                      {col.status ===
                                                        SchemaCtxDiffStatus.NEW && (
                                                        <Tooltip title="new">
                                                          <IconButton
                                                            aria-label="new-schema"
                                                            size="small"
                                                            color={
                                                              col.status ===
                                                              SchemaCtxDiffStatus.NEW
                                                                ? "success"
                                                                : "inherit"
                                                            }
                                                          >
                                                            <AddIcon fontSize="small" />
                                                          </IconButton>
                                                        </Tooltip>
                                                      )}
                                                      {col.status ===
                                                        SchemaCtxDiffStatus.DELETE && (
                                                        <>
                                                          <Tooltip title="delete">
                                                            <IconButton
                                                              aria-label="delete-schema"
                                                              size="small"
                                                              color={
                                                                col.status ===
                                                                SchemaCtxDiffStatus.DELETE
                                                                  ? "error"
                                                                  : "inherit"
                                                              }
                                                            >
                                                              <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                          </Tooltip>
                                                        </>
                                                      )}
                                                    </TableCell>
                                                  </TableRow>
                                                </React.Fragment>
                                              ))}
                                            </React.Fragment>
                                          ))}
                                        </React.Fragment>
                                      ))}
                                    </>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                          {/* SCHEMA DIFF - SELECTION OF OLD FIELD */}
                          <Grid
                            size={3}
                            sx={{
                              height: "100%",
                              minHeight: 0,
                              overflow: "auto",
                            }}
                          >
                            <Box>
                              <TableContainer component={Paper} elevation={0}>
                                <Table
                                  size="small"
                                  aria-label="old schema table"
                                >
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 700 }}>
                                        Name
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: 700 }}>
                                        Action
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {displayOldFields === null ||
                                    displayOldFields?.length === 0 ? (
                                      <TableRow>
                                        <TableCell colSpan={2}>
                                          <Typography color="text.secondary">
                                            No old schema fields.
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ) : (
                                      displayOldFields.map((field) => (
                                        <TableRow key={field?.id || ""} hover>
                                          <TableCell>
                                            {field?.name || "-"}
                                          </TableCell>
                                          <TableCell>
                                            <Tooltip title="select">
                                              <IconButton
                                                aria-label="select-field"
                                                size="small"
                                                onClick={() =>
                                                  onUpdateSchemaCtxFieldByOldField(
                                                    field.id,
                                                    field.name
                                                  )
                                                }
                                              >
                                                <DoneIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </TableCell>
                                        </TableRow>
                                      ))
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}
                  {activeStep === 1 && (
                    <>
                      <Box
                        display="grid"
                        gap={2}
                        sx={{ height: "100%", minHeight: 0 }}
                      >
                        <Grid
                          container
                          spacing={3}
                          sx={{ height: "100%", minHeight: 0 }}
                        >
                          <Grid
                            size={6}
                            sx={{
                              height: "100%",
                              minHeight: 0,
                              overflow: "auto",
                            }}
                          >
                            <TableContainer component={Paper} elevation={0}>
                              <Table
                                size="small"
                                aria-label="knowledge source table"
                              >
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      Old Question
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      Old Consult
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      New Question
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      New Consult
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      Status
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      Actions
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {schemaCtxDiff && schemaCtxDiff.length > 0 ? (
                                    schemaCtxDiff.map((schema) =>
                                      schema.tables.map((table) =>
                                        table.columns.map((col) => (
                                          <TableRow
                                            key={`${schema.id}-${table.id}-${col.id}`}
                                            hover
                                          >
                                            <TableCell>{schema.name}</TableCell>
                                            <TableCell>
                                              {table.name || "—"}
                                            </TableCell>
                                            <TableCell>
                                              {col.name || "—"}
                                            </TableCell>
                                            <TableCell>
                                              {col.dataType?.name || "—"}
                                            </TableCell>
                                            <TableCell>{"—"}</TableCell>
                                            <TableCell align="right">
                                              <Stack
                                                direction="row"
                                                spacing={1}
                                              >
                                                <Tooltip title="watch">
                                                  <IconButton
                                                    aria-label="watch"
                                                    size="small"
                                                    onClick={() => {}}
                                                  >
                                                    <VisibilityIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                                <Tooltip title="delete">
                                                  <IconButton
                                                    aria-label="delete"
                                                    size="small"
                                                    onClick={() => {}}
                                                  >
                                                    <DeleteIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              </Stack>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      )
                                    )
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={6}>
                                        <Typography color="text.secondary">
                                          No knowledge source rows available.
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                          <Grid
                            size={6}
                            sx={{
                              height: "100%",
                              minHeight: 0,
                              overflow: "auto",
                            }}
                          >
                            <TextField
                              label="Old Question"
                              type="old-question"
                              value={name}
                              required
                              disabled
                              onChange={(e) => {}}
                              fullWidth
                              multiline
                              minRows={2}
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              label="Old Consult"
                              type="old-consult"
                              value={name}
                              required
                              onChange={(e) => {}}
                              fullWidth
                              multiline
                              minRows={4}
                              disabled
                              sx={{ mb: 2 }}
                            />
                            <Button
                              variant="outlined"
                              onClick={() => {}}
                              disabled={false}
                              loading={false}
                              sx={{ mb: 2 }}
                            >
                              old run
                            </Button>
                            <Box sx={{ mb: 2 }}>
                              {/* <ChatResultTable data={rows} /> */}
                            </Box>
                            <TextField
                              label="New question"
                              type="new-question"
                              value={name}
                              required
                              onChange={(e) => {}}
                              fullWidth
                              multiline
                              minRows={2}
                              sx={{ mb: 2 }}
                            />
                            <TextField
                              label="New Consult"
                              type="new-consult"
                              value={name}
                              required
                              onChange={(e) => {}}
                              fullWidth
                              multiline
                              minRows={4}
                              sx={{ mb: 2 }}
                            />
                            <Button
                              variant="outlined"
                              onClick={() => {}}
                              disabled={false}
                              loading={false}
                              sx={{ mb: 2 }}
                            >
                              new run
                            </Button>
                            <Box sx={{ mb: 2 }}>
                              {/* <ChatResultTable data={rows} /> */}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  )}
                </React.Fragment>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
          <Button
            type="button"
            variant="outlined"
            color="error"
            disabled={true}
            sx={{ textTransform: "none" }}
            onClick={() => {}}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
