// app/nlq-good/create/client.tsx
"use client";

import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { CreateNlqQaGoodAction } from "@/_actions/nlq-qa-good/create.action";
import { InfoExtractorAction } from "@/_actions/nlq-qa-info/execute-query.action";
import { TNlqQaGoodOutWithUserAndConnRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import { UpdateNlqQaGoodAction } from "@/_actions/nlq-qa-good/update.action";

export default function NlqClient({
  initial,
}: {
  initial?: TNlqQaGoodOutWithUserAndConnRequestDto;
}) {
  const router = useRouter();

  const [nlq, setNlq] =
    React.useState<TNlqQaGoodOutWithUserAndConnRequestDto | null>(
      initial || {
        id: "",
        question: "",
        query: "",
        originId: "",
        dbConnectionId: "",
        knowledgeSourceId: "",
        isOnKnowledgeSource: false,
        detailQuestion: "",
        think: "",
        tablesColumns: [],
        semanticFields: [],
        semanticTables: [],
        flags: [],
        isDelete: false,
        questionBy: "",
        createdBy: "",
        updatedBy: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: "", email: "" },
        dbConnection: {
          id: "",
          id_vbd_splitter: "",
          name: "",
          description: "",
          type: "mysql",
          host: "",
          port: 0,
          database: "",
          username: "",
          password: "",
          sid: null,
          schema_query: "",
          createdBy: "",
          updatedBy: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

  const [dbConn, setDbConn] = React.useState<
    TDbConnectionOutRequestDtoWithVbAndUser[]
  >([]);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [running, setRunning] = React.useState(false);
  const [ranOk, setRanOk] = React.useState(false);
  const [rows, setRows] = React.useState<any[] | null>(null);

  const [saving, setSaving] = React.useState(false);
  const disabledRun = !nlq?.question.trim() || !nlq?.query.trim();
  const disabledSave = !ranOk || saving;

  React.useEffect(() => {
    (async () => {
      const res = await ReadAllDbConnectionAction();

      if (res.ok) {
        setDbConn(res.data || []);
      }
      if (!res.ok) {
        setError(res?.message || "Failed to load DB Connections");
      }
    })();
  }, []);

  const onRun = async () => {
    if (disabledRun) return;
    setRunning(true);
    setRanOk(false);
    setRows(null);
    setError(null);
    setSuccess(null);
    const r = await InfoExtractorAction({
      query: nlq?.query?.trim() || "",
      connId: nlq?.dbConnectionId || "",
    });

    if (r.ok) {
      setRows(r.data.data || []);
      setRanOk(true);
      setSuccess("SQL ran successfully");
    }

    if (!r.ok) {
      setError(r.message || "Failed to run SQL");
    }
    setRunning(false);
  };

  const onSave = async () => {
    if (disabledSave) return;
    setSaving(true);
    const r = await CreateNlqQaGoodAction({
      question: nlq?.question?.trimStart().trimEnd().toLowerCase() || "",
      query: nlq?.query?.trimStart().trimEnd().toLowerCase() || "",
      dbConnectionId: nlq?.dbConnectionId || "",
      isOnKnowledgeSource: nlq?.isOnKnowledgeSource || false,
    });

    if (r.ok) {
      setSuccess("NLQ created & uploaded.");
      router.push("/nlq-good");
    }
    if (!r.ok) {
      setError(r?.message ?? "Creation failed");
    }
    setSaving(false);
  };

  const onUpdate = async () => {
    if (disabledSave) return;
    setSaving(true);
    const r = await UpdateNlqQaGoodAction({
      id: nlq?.id || "",
      question: nlq?.question?.trimStart().trimEnd().toLowerCase() || "",
      query: nlq?.query?.trimStart().trimEnd().toLowerCase() || "",
      dbConnectionId: nlq?.dbConnectionId || "",
      isOnKnowledgeSource: nlq?.isOnKnowledgeSource || false,
    });

    if (r.ok) {
      setSuccess("NLQ updated.");
      router.push("/nlq-good");
    }

    if (!r.ok) {
      setError(r?.message ?? "Update failed");
    }
    setSaving(false);
  };

  const onCancel = () => router.push("/nlq-good");

  const onSubmit = async () => {
    if (!nlq) return;
    setError(null);
    setSuccess(null);

    if (initial) {
      await onUpdate();
    } else {
      await onSave();
    }
  };

  return (
    <Box className="max-w-5xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {initial ? `Update ` : `Create `} NLQ (Admin)
      </Typography>

      <Paper className="p-4" elevation={1}>
        <Stack spacing={2}>
          {/* DB Connections */}
          <FormControl fullWidth>
            <InputLabel id="db-connection-label">DB Connection</InputLabel>
            <Select
              labelId="db-connection-label"
              value={nlq?.dbConnectionId || ""} // Ensure value defaults to an empty string
              onChange={(e) =>
                setNlq({ ...nlq, dbConnectionId: e.target.value })
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {dbConn && dbConn.length > 0 ? (
                dbConn.map((dbConnection) => (
                  <MenuItem key={dbConnection.id} value={dbConnection.id}>
                    {dbConnection.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <em>Loading...</em>
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {/* On Knowledge source */}
          <FormControl fullWidth>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>On Knowledge Source:</Typography>
              <Switch
                checked={!!nlq?.isOnKnowledgeSource}
                onChange={(e) =>
                  setNlq({ ...nlq, isOnKnowledgeSource: e.target.checked })
                }
                inputProps={{ "aria-label": "On Knowledge Source" }}
              />
            </Stack>
          </FormControl>
        </Stack>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Paper className="p-4" elevation={1}>
        <Stack spacing={2}>
          <TextField
            label="Question"
            value={nlq.question}
            onChange={(e) => setNlq({ ...nlq, question: e.target.value })}
            fullWidth
            placeholder="Write a question…"
            autoFocus
            multiline
            minRows={2}
          />
          <TextField
            label="Query (SQL)"
            value={nlq.query}
            onChange={(e) => setNlq({ ...nlq, query: e.target.value })}
            fullWidth
            multiline
            minRows={6}
            placeholder="Write a query…"
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={onRun}
              disabled={disabledRun || running}
            >
              {running ? <CircularProgress size={18} /> : "Run SQL"}
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={disabledSave}
            >
              {saving ? <CircularProgress size={18} /> : "Save"}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Divider sx={{ my: 2 }} />

          {running ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          ) : rows ? (
            <ChatResultTable data={rows} />
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
