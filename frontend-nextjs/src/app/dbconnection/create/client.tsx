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
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { TNlqInformationData } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { ExtractSchemaAction } from "@/_actions/dbconnection/extrac-schema.action";

export default function DbConnectionClient({
  initial,
}: {
  initial?: TDbConnectionOutRequestDtoWithVbAndUser;
}) {
  const router = useRouter();

  const [vbdSplitters, setVbdSplitters] = React.useState<TVbdOutRequestDto[]>(
    []
  );

  const [dbConn, setDbConn] =
    React.useState<TDbConnectionOutRequestDtoWithVbAndUser | null>(
      initial || null
    );
  const [vbdSplitterId, setVbdSplitterId] = React.useState(
    initial ? initial.id_vbd_splitter || "" : ""
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isUpdate, setIsUpdate] = React.useState(!!initial);
  const [rows, setRows] = React.useState<TNlqInformationData | null>({
    data: null,
  });
  const [schemaSuccess, setSchemaSuccess] = React.useState<boolean>(false);
  const [schemaLoading, setSchemaLoading] = React.useState<boolean>(false);

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

  const onRun = async () => {
    setError(null);
    setRows(null);
    setSchemaLoading(true);
    try {
      const res = await ExtractSchemaAction({
        type: ["mysql", "postgres", "mssql", "oracle"].includes(
          dbConn?.type as string
        )
          ? (dbConn?.type as "mysql" | "postgres" | "mssql" | "oracle")
          : "mysql",
        host: dbConn?.host.trim() || "",
        port: dbConn?.port || 0,
        database: dbConn?.database.trim() || "",
        username: dbConn?.username.trim() || "",
        password: dbConn?.password.trim() || "",
        sid: dbConn?.sid.trim() || null,
        schema_query: dbConn?.schema_query.trimStart().trimEnd() || "",
      });
      console.log("DB Connection run:", res);
      if (res) {
        setRows(res.data || null);
      }
      setSchemaSuccess(true);
    } catch (error) {
      console.error("Error running DB Connection:", {
        error: error.message,
      });
      setError(`Failed to run DB Connection: ${error.message}`);
      setSchemaSuccess(false);
    } finally {
      setSchemaLoading(false);
    }
  };

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
        name: dbConn?.name || "",
        description: dbConn?.description || "",
        type: dbConn?.type || "mysql",
        host: dbConn?.host || "",
        port: dbConn?.port || 0,
        database: dbConn?.database || "",
        username: dbConn?.username || "",
        password: dbConn?.password || "",
        sid: dbConn?.sid || "",
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
        id: initial!.id,
        name: dbConn?.name.toLowerCase().trim() || "",
        description:
          dbConn?.description.toLowerCase().trimStart().trimEnd() || "",
        type: dbConn?.type || "mysql",
        host: dbConn?.host.trim() || "",
        port: dbConn?.port || 0,
        database: dbConn?.database.trim() || "",
        username: dbConn?.username.trim() || "",
        password: dbConn?.password.trim() || "",
        sid: dbConn?.sid.trim() || "",
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
              label="Connection name"
              value={dbConn?.name || ""}
              required
              onChange={(e) => setDbConn({ ...dbConn, name: e.target.value })}
              inputProps={{ maxLength: 100 }}
              fullWidth
            />

            <TextField
              label="Description"
              value={dbConn?.description || ""}
              required
              onChange={(e) =>
                setDbConn({ ...dbConn, description: e.target.value })
              }
              inputProps={{ maxLength: 255 }}
              fullWidth
              multiline
              minRows={3}
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

            <FormControl fullWidth>
              <InputLabel id="db-type-label">Type</InputLabel>
              <Select
                labelId="db-type-label"
                value={dbConn?.type || ""}
                required
                onChange={(e) =>
                  setDbConn({
                    ...dbConn,
                    type: e.target.value as
                      | "mysql"
                      | "postgres"
                      | "mssql"
                      | "oracle",
                  })
                }
              >
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="postgres">Postgres</MenuItem>
                <MenuItem value="mssql">MSSQL</MenuItem>
                <MenuItem value="oracle">Oracle</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Host"
              value={dbConn?.host || ""}
              required
              onChange={(e) => setDbConn({ ...dbConn, host: e.target.value })}
              inputProps={{ maxLength: 100 }}
              fullWidth
            />

            <TextField
              label="Port"
              value={dbConn?.port || ""}
              required
              onChange={(e) => {
                const portValue = e.target.value;
                if (/^\d*$/.test(portValue)) {
                  setDbConn({ ...dbConn, port: parseInt(portValue) });
                  setError(null); // Clear error if valid
                } else {
                  setError("Port must be a valid number.");
                }
              }}
              inputProps={{ maxLength: 5 }}
              fullWidth
            />

            <TextField
              label="Database"
              value={dbConn?.database || ""}
              required
              onChange={(e) =>
                setDbConn({ ...dbConn, database: e.target.value })
              }
              inputProps={{ maxLength: 100 }}
              fullWidth
            />

            <TextField
              label="Username"
              value={dbConn?.username || ""}
              required
              onChange={(e) =>
                setDbConn({ ...dbConn, username: e.target.value })
              }
              inputProps={{ maxLength: 100 }}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={dbConn?.password || ""}
              required
              onChange={(e) =>
                setDbConn({ ...dbConn, password: e.target.value })
              }
              inputProps={{ maxLength: 100 }}
              fullWidth
            />
            <TextField
              label="SID (Oracle only)"
              value={dbConn?.sid || ""}
              required
              onChange={(e) => setDbConn({ ...dbConn, sid: e.target.value })}
              inputProps={{ maxLength: 100 }}
              fullWidth
            />
            <TextField
              label="Query Extractor"
              value={dbConn?.schema_query || ""}
              required
              onChange={(e) =>
                setDbConn({ ...dbConn, schema_query: e.target.value })
              }
              inputProps={{ maxLength: 100 }}
              fullWidth
              multiline
              minRows={3}
            />

            <Box display="flex" gap={1} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={onRun}
                disabled={schemaLoading || !dbConn?.schema_query}
              >
                {schemaLoading ? <CircularProgress size={18} /> : "Run"}
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={loading || !schemaSuccess}
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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        ) : rows?.data ? (
          <Box sx={{ mt: 2 }}>
            <ChatResultTable data={rows.data} />
          </Box>
        ) : null}
      </Paper>
    </Box>
  );
}
